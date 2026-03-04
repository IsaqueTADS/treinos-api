import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

import { WeekDay } from "@/generated/prisma/enums.js";
import { auth } from "@/lib/auth.js";
import { CreateWorkoutPlan } from "@/use-cases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "@/use-cases/GetUserTrainData.js";
import { ListWorkoutPlans } from "@/use-cases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "@/use-cases/UpsertUserTrainData.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos. Seu público principal são pessoas leigas em musculação.
- Respostas curtas e objetivas.

## Regras de Interação

1. **SEMPRE** chame a tool \`getUserTrainData\` antes de qualquer interação com o usuário. Isso é obrigatório.
2. Se o usuário **não tem dados cadastrados** (retornou null):
   - Pergunte nome, peso (kg), altura (cm), idade e % de gordura corporal (inteiro de 0 a 100, onde 100 = 100%).
   - Faça perguntas simples e diretas, tudo em uma única mensagem.
   - Após receber os dados, salve com a tool \`updateUserTrainData\`. **IMPORTANTE**: converta o peso de kg para gramas (multiplique por 1000) antes de salvar.
3. Se o usuário **já tem dados cadastrados**: cumprimente-o pelo nome de forma amigável.

## Criação de Plano de Treino

Quando o usuário quiser criar um plano de treino:
- Pergunte o objetivo, quantos dias por semana ele pode treinar e se tem restrições físicas ou lesões.
- Poucas perguntas, simples e diretas.
- O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY).
- Dias sem treino devem ter: \`isRest: true\`, \`exercises: []\`, \`estimatedDurationInSeconds: 0\`.
- Chame a tool \`createWorkoutPlan\` para salvar o plano.

### Divisões de Treino (Splits)

Escolha a divisão adequada com base nos dias disponíveis:
- **2-3 dias/semana**: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros)
- **4 dias/semana**: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen)
- **5 dias/semana**: PPLUL — Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana)
- **6 dias/semana**: PPL 2x — Push/Pull/Legs repetido

### Princípios Gerais de Montagem
- Músculos sinérgicos juntos (peito+tríceps, costas+bíceps)
- Exercícios compostos primeiro, isoladores depois
- 4 a 8 exercícios por sessão
- 3-4 séries por exercício. 8-12 reps (hipertrofia), 4-6 reps (força)
- Descanso entre séries: 60-90s (hipertrofia), 2-3min (compostos pesados)
- Evitar treinar o mesmo grupo muscular em dias consecutivos
- Nomes descritivos para cada dia (ex: "Superior A - Peito e Costas", "Descanso")

### Imagens de Capa (coverImageUrl)

SEMPRE forneça um \`coverImageUrl\` para cada dia de treino. Escolha com base no foco muscular:

**Dias majoritariamente superiores** (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

**Dias majoritariamente inferiores** (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alterne entre as duas opções de cada categoria para variar. Dias de descanso usam imagem de superior.`;

export const aiRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/ai", async function (request, reply) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    const { messages } = request.body as { messages: UIMessage[] };

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: {
        getUserTrainData: tool({
          description:
            "Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna null se não houver dados cadastrados.",
          inputSchema: z.object({}),
          execute: async () => {
            const getUserTrainData = new GetUserTrainData();
            return getUserTrainData.execute({ userId });
          },
        }),
        updateUserTrainData: tool({
          description:
            "Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).",
          inputSchema: z.object({
            weightInGrams: z
              .number()
              .describe("Peso do usuário em gramas (ex: 70kg = 70000)"),
            heightInCentimeters: z
              .number()
              .describe("Altura do usuário em centímetros"),
            age: z.number().describe("Idade do usuário"),
            bodyFatPercentage: z
              .number()
              .int()
              .min(0)
              .max(100)
              .describe("Percentual de gordura corporal (0 a 100)"),
          }),
          execute: async (params) => {
            const upsertUserTrainData = new UpsertUserTrainData();
            return upsertUserTrainData.execute({ userId, ...params });
          },
        }),
        getWorkoutPlans: tool({
          description:
            "Lista todos os planos de treino do usuário autenticado.",
          inputSchema: z.object({}),
          execute: async () => {
            const listWorkoutPlans = new ListWorkoutPlans();
            return listWorkoutPlans.execute({ userId });
          },
        }),
        createWorkoutPlan: tool({
          description: "Cria um novo plano de treino completo para o usuário.",
          inputSchema: z.object({
            name: z.string().describe("Nome do plano de treino"),
            workoutDays: z
              .array(
                z.object({
                  name: z
                    .string()
                    .describe("Nome do dia (ex: Peito e Tríceps, Descanso)"),
                  weekDay: z.enum(WeekDay).describe("Dia da semana"),
                  isRest: z
                    .boolean()
                    .describe("Se é dia de descanso (true) ou treino (false)"),
                  estimatedDurationInSeconds: z
                    .number()
                    .describe(
                      "Duração estimada em segundos (0 para dias de descanso)",
                    ),
                  coverImageUrl: z
                    .string()
                    .url()
                    .describe(
                      "URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.",
                    ),
                  exercises: z
                    .array(
                      z.object({
                        order: z.number().describe("Ordem do exercício no dia"),
                        name: z.string().describe("Nome do exercício"),
                        sets: z.number().describe("Número de séries"),
                        reps: z.number().describe("Número de repetições"),
                        restTimeInSeconds: z
                          .number()
                          .describe(
                            "Tempo de descanso entre séries em segundos",
                          ),
                      }),
                    )
                    .describe(
                      "Lista de exercícios (vazia para dias de descanso)",
                    ),
                }),
              )
              .describe(
                "Array com exatamente 7 dias de treino (MONDAY a SUNDAY)",
              ),
          }),
          execute: async (input) => {
            const createWorkoutPlan = new CreateWorkoutPlan();
            return createWorkoutPlan.execute({
              userId,
              name: input.name,
              workoutDays: input.workoutDays,
            });
          },
        }),
      },
    });

    const response = result.toUIMessageStreamResponse();
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body);
  });
};
