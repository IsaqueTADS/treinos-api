import { NotFoundError } from "@/errors/index.js";
import { WeekDay } from "@/generated/prisma/enums.js";
import { prisma } from "@/lib/db.js";

interface inputDto {
  useId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedTimeInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: inputDto) {
    return prisma.$transaction(async (tx) => {
      const existingWorkoutPlan = await tx.workoutPlan.findFirst({
        where: {
          isActive: true,
        },
      });
      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: {
            id: existingWorkoutPlan.id,
          },
          data: {
            isActive: false,
          },
        });
      }
      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.useId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              estimatedTimeInSeconds: workoutDay.estimatedTimeInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  order: exercise.order,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });
      const result = await tx.workoutPlan.findUnique({
        where: {
          id: workoutPlan.id,
        },
        include: {
          workoutDays: {
            include: {
              exercises: true,
            },
          },
        },
      });
      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }
      return result;
    });
  }
}
