// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quizdaw.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@quizdaw.com', password: adminHash, role: 'ADMIN' },
  })

  // Creator user
  const creatorHash = await bcrypt.hash('creator123', 12)
  const creator = await prisma.user.upsert({
    where: { email: 'creator@quizdaw.com' },
    update: {},
    create: { name: 'Quiz Creator', email: 'creator@quizdaw.com', password: creatorHash, role: 'CREATOR' },
  })

  // Sample Quiz 1
  const quiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-sample-1' },
    update: {},
    create: {
      id: 'quiz-sample-1',
      title: 'JavaScript Fundamentals',
      description: 'Test your JS knowledge — closures, promises, and more!',
      category: 'Programming',
      visibility: 'PUBLIC',
      timePerQ: 20,
      totalPoints: 500,
      creatorId: creator.id,
      questions: {
        create: [
          {
            text: 'Which keyword declares a block-scoped variable in JavaScript?',
            type: 'MULTIPLE_CHOICE',
            points: 100,
            timeLimit: 20,
            order: 0,
            explanation: 'let and const are block-scoped, unlike var.',
            options: {
              create: [
                { text: 'var', isCorrect: false, order: 0 },
                { text: 'let', isCorrect: true, order: 1 },
                { text: 'define', isCorrect: false, order: 2 },
                { text: 'set', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'What does === check in JavaScript?',
            type: 'MULTIPLE_CHOICE',
            points: 100,
            timeLimit: 20,
            order: 1,
            explanation: 'Triple equals checks both value AND type (strict equality).',
            options: {
              create: [
                { text: 'Value only', isCorrect: false, order: 0 },
                { text: 'Type only', isCorrect: false, order: 1 },
                { text: 'Value and type', isCorrect: true, order: 2 },
                { text: 'Reference', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'JavaScript is a single-threaded language.',
            type: 'TRUE_FALSE',
            points: 100,
            timeLimit: 15,
            order: 2,
            explanation: 'JS runs on a single thread using an event loop.',
            options: {
              create: [
                { text: 'True', isCorrect: true, order: 0 },
                { text: 'False', isCorrect: false, order: 1 },
              ],
            },
          },
          {
            text: 'Which method converts a JSON string to a JavaScript object?',
            type: 'MULTIPLE_CHOICE',
            points: 100,
            timeLimit: 20,
            order: 3,
            options: {
              create: [
                { text: 'JSON.stringify()', isCorrect: false, order: 0 },
                { text: 'JSON.parse()', isCorrect: true, order: 1 },
                { text: 'JSON.convert()', isCorrect: false, order: 2 },
                { text: 'JSON.decode()', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Promises in JavaScript help handle asynchronous operations.',
            type: 'TRUE_FALSE',
            points: 100,
            timeLimit: 15,
            order: 4,
            options: {
              create: [
                { text: 'True', isCorrect: true, order: 0 },
                { text: 'False', isCorrect: false, order: 1 },
              ],
            },
          },
        ],
      },
    },
  })

  // Sample Quiz 2
  await prisma.quiz.upsert({
    where: { id: 'quiz-sample-2' },
    update: {},
    create: {
      id: 'quiz-sample-2',
      title: 'World Geography',
      description: 'How well do you know the world? Capitals, flags & more!',
      category: 'Geography',
      visibility: 'PUBLIC',
      timePerQ: 25,
      totalPoints: 400,
      creatorId: admin.id,
      questions: {
        create: [
          {
            text: 'What is the capital of Japan?',
            type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, order: 0,
            options: { create: [
              { text: 'Osaka', isCorrect: false, order: 0 },
              { text: 'Tokyo', isCorrect: true, order: 1 },
              { text: 'Kyoto', isCorrect: false, order: 2 },
              { text: 'Hiroshima', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'The Sahara Desert is located in South America.',
            type: 'TRUE_FALSE', points: 100, timeLimit: 15, order: 1,
            explanation: 'The Sahara is in North Africa.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
          {
            text: 'Which country has the largest land area?',
            type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: 'Canada', isCorrect: false, order: 0 },
              { text: 'China', isCorrect: false, order: 1 },
              { text: 'Russia', isCorrect: true, order: 2 },
              { text: 'USA', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Mount Everest is in the Himalayan mountain range.',
            type: 'TRUE_FALSE', points: 100, timeLimit: 15, order: 3,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
    },
  })

  console.log('✅ Database seeded!')
  console.log('   Admin:   admin@quizdaw.com / admin123')
  console.log('   Creator: creator@quizdaw.com / creator123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
