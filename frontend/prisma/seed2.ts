import { DifficultyLevel } from '@prisma/client'
import { prisma } from '../src/lib/prisma'

async function main() {
  const adminId = 'cms6878b20000xi5t5q1s9g0t' // Assume this admin exists from first seed
  
  // We'll create the quizzes, but if admin doesn't exist, we will just fetch the first user
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  const creatorId = user ? user.id : 'unknown'
  if (creatorId === 'unknown') {
    console.error('No admin user found to attach quizzes to.')
    return
  }

  const NEW_LANGS = ['TypeScript', 'Go', 'Rust', 'C#', 'PHP']
  const LEVELS = [DifficultyLevel.SIMPLE, DifficultyLevel.NORMAL, DifficultyLevel.HARD]
  
  console.log(`Starting to seed ${NEW_LANGS.length * 3} new quizzes...`)

  for (const lang of NEW_LANGS) {
    for (const level of LEVELS) {
      const title = `${lang} ${level.charAt(0) + level.slice(1).toLowerCase()} Quiz`
      
      const existing = await prisma.quiz.findFirst({ where: { title } })
      if (existing) {
        console.log(`Quiz ${title} already exists. Skipping.`)
        continue
      }
      
      const quiz = await prisma.quiz.create({
        data: {
          title,
          description: `Test your ${lang} skills with this ${level.toLowerCase()} level quiz.`,
          category: 'Programming',
          language: lang,
          level: level,
          timePerQ: level === DifficultyLevel.SIMPLE ? 15 : level === DifficultyLevel.NORMAL ? 20 : 30,
          passPercent: level === DifficultyLevel.SIMPLE ? 60 : level === DifficultyLevel.NORMAL ? 70 : 80,
          totalPoints: 100,
          creatorId: creatorId,
          questions: {
            create: [
              {
                text: `Question 1 about ${lang} (${level})`,
                type: 'MULTIPLE_CHOICE',
                points: 50,
                options: {
                  create: [
                    { text: 'Correct Answer', isCorrect: true },
                    { text: 'Wrong Answer 1', isCorrect: false },
                    { text: 'Wrong Answer 2', isCorrect: false },
                    { text: 'Wrong Answer 3', isCorrect: false }
                  ]
                }
              },
              {
                text: `Question 2 about ${lang} (${level})`,
                type: 'MULTIPLE_CHOICE',
                points: 50,
                options: {
                  create: [
                    { text: 'Correct Answer', isCorrect: true },
                    { text: 'Wrong Answer A', isCorrect: false },
                    { text: 'Wrong Answer B', isCorrect: false },
                    { text: 'Wrong Answer C', isCorrect: false }
                  ]
                }
              }
            ]
          }
        }
      })
      console.log(`Created quiz: ${quiz.title}`)
    }
  }
  
  console.log('Finished seeding new languages!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
