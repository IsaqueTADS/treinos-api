import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'

import type { WeekDay } from '../generated/prisma/enums.js'
import { prisma } from '../lib/db.js'

dayjs.extend(utc)

interface InputDto {
  userId: string
  date: string
}

interface OutputDto {
  activeWorkoutPlanId?: string
  todayWorkoutDay?: {
    workoutPlanId: string
    id: string
    name: string
    isRest: boolean
    weekDay: WeekDay
    estimatedDurationInSeconds: number
    coverImageUrl?: string
    exercisesCount: number
  }
  workoutStreak: number
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean
      workoutDayStarted: boolean
    }
  >
}

const DAYJS_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const currentDate = dayjs.utc(dto.date, 'YYYY-MM-DD')

    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    })

    const todayWeekDay = DAYJS_TO_WEEKDAY[currentDate.day()]
    const todayWorkoutDay = workoutPlan?.workoutDays.find(
      (day) => day.weekDay === todayWeekDay,
    )

    const weekStart = currentDate.startOf('week')
    const weekEnd = currentDate.endOf('week').subtract(1, 'day')

    const consistencyByDay = await this.buildConsistencyByDay(
      dto.userId,
      weekStart,
      weekEnd,
    )

    let workoutStreak = 0

    if (workoutPlan) {
      workoutStreak = await this.calculateWorkoutStreak(
        dto.userId,
        currentDate,
        workoutPlan.workoutDays,
      )
    }

    return {
      activeWorkoutPlanId: workoutPlan?.id,
      todayWorkoutDay:
        todayWorkoutDay && workoutPlan
          ? {
              workoutPlanId: workoutPlan?.id,
              id: todayWorkoutDay.id,
              name: todayWorkoutDay.name,
              isRest: todayWorkoutDay.isRest,
              weekDay: todayWorkoutDay.weekDay,
              estimatedDurationInSeconds:
                todayWorkoutDay.estimatedDurationInSeconds,
              coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
              exercisesCount: todayWorkoutDay.exercises.length,
            }
          : undefined,
      workoutStreak,
      consistencyByDay,
    }
  }

  private async buildConsistencyByDay(
    userId: string,
    weekStart: dayjs.Dayjs,
    weekEnd: dayjs.Dayjs,
  ): Promise<OutputDto['consistencyByDay']> {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.endOf('day').toDate(),
        },
      },
    })

    const sessionsByDate = new Map<
      string,
      { started: boolean; completed: boolean }
    >()
    for (const session of sessions) {
      const dateKey = dayjs.utc(session.startedAt).format('YYYY-MM-DD')
      const existing = sessionsByDate.get(dateKey)

      const started = true
      const completed = session.completedAt !== null

      if (existing) {
        sessionsByDate.set(dateKey, {
          started: true,
          completed: existing.completed || completed,
        })
      } else {
        sessionsByDate.set(dateKey, { started, completed })
      }
    }

    const consistency: OutputDto['consistencyByDay'] = {}
    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, 'day')
      const dateKey = day.format('YYYY-MM-DD')
      const sessionData = sessionsByDate.get(dateKey)

      consistency[dateKey] = {
        workoutDayStarted: sessionData?.started ?? false,
        workoutDayCompleted: sessionData?.completed ?? false,
      }
    }

    return consistency
  }

  private async calculateWorkoutStreak(
    userId: string,
    currentDate: dayjs.Dayjs,
    workoutDays: Array<{ weekDay: WeekDay; isRest: boolean }>,
  ): Promise<number> {
    const workoutDaysByWeekDay = new Map<WeekDay, { isRest: boolean }>()
    for (const day of workoutDays) {
      workoutDaysByWeekDay.set(day.weekDay, { isRest: day.isRest })
    }

    const lookbackDays = 90
    const lookbackStart = currentDate
      .subtract(lookbackDays, 'day')
      .startOf('day')

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        completedAt: { not: null },
        startedAt: {
          gte: lookbackStart.toDate(),
          lte: currentDate.endOf('day').toDate(),
        },
      },
    })

    const completedDates = new Set<string>()
    for (const session of sessions) {
      completedDates.add(dayjs.utc(session.startedAt).format('YYYY-MM-DD'))
    }

    let streak = 0
    for (let i = 0; i <= lookbackDays; i++) {
      const checkDate = currentDate.subtract(i, 'day')
      const weekDay = DAYJS_TO_WEEKDAY[checkDate.day()]
      const planDay = workoutDaysByWeekDay.get(weekDay)

      if (!planDay) {
        continue
      }

      if (planDay.isRest) {
        streak++
        continue
      }

      const dateKey = checkDate.format('YYYY-MM-DD')
      if (completedDates.has(dateKey)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }
}