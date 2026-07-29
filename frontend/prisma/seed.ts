// prisma/seed.ts
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quizdaw.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@quizdaw.com', password: adminHash, role: 'ADMIN' },
  })

  const creatorHash = await bcrypt.hash('creator123', 12)
  const creator = await prisma.user.upsert({
    where: { email: 'creator@quizdaw.com' },
    update: {},
    create: { name: 'Quiz Creator', email: 'creator@quizdaw.com', password: creatorHash, role: 'CREATOR' },
  })

  // ── Existing General Quizzes ──────────────────────────────────────────────
  await prisma.quiz.upsert({
    where: { id: 'quiz-sample-1' },
    update: {},
    create: {
      id: 'quiz-sample-1',
      title: 'JavaScript Fundamentals',
      description: 'Test your JS knowledge — closures, promises, and more!',
      category: 'Programming',
      language: 'JavaScript',
      level: 'SIMPLE',
      visibility: 'PUBLIC',
      timePerQ: 20,
      totalPoints: 500,
      passPercent: 60,
      creatorId: creator.id,
      questions: {
        create: [
          {
            text: 'Which keyword declares a block-scoped variable in JavaScript?',
            type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, order: 0,
            explanation: 'let and const are block-scoped, unlike var.',
            options: { create: [
              { text: 'var', isCorrect: false, order: 0 },
              { text: 'let', isCorrect: true, order: 1 },
              { text: 'define', isCorrect: false, order: 2 },
              { text: 'set', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does === check in JavaScript?',
            type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, order: 1,
            explanation: 'Triple equals checks both value AND type (strict equality).',
            options: { create: [
              { text: 'Value only', isCorrect: false, order: 0 },
              { text: 'Type only', isCorrect: false, order: 1 },
              { text: 'Value and type', isCorrect: true, order: 2 },
              { text: 'Reference', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'JavaScript is a single-threaded language.',
            type: 'TRUE_FALSE', points: 100, timeLimit: 15, order: 2,
            explanation: 'JS runs on a single thread using an event loop.',
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which method converts a JSON string to a JavaScript object?',
            type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'JSON.stringify()', isCorrect: false, order: 0 },
              { text: 'JSON.parse()', isCorrect: true, order: 1 },
              { text: 'JSON.convert()', isCorrect: false, order: 2 },
              { text: 'JSON.decode()', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Promises in JavaScript help handle asynchronous operations.',
            type: 'TRUE_FALSE', points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
    },
  })

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
      passPercent: 60,
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

  // ── Programming Language Quizzes ─────────────────────────────────────────
  const LANGS = [
    {
      lang: 'C',
      simple: {
        id: 'quiz-c-simple',
        title: 'C Programming — Simple',
        desc: 'Basic C language concepts: variables, loops, and functions.',
        questions: [
          {
            text: 'Which symbol is used to end a statement in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: 'In C, every statement ends with a semicolon (;).',
            options: { create: [
              { text: '.', isCorrect: false, order: 0 },
              { text: ';', isCorrect: true, order: 1 },
              { text: ':', isCorrect: false, order: 2 },
              { text: ',', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the correct syntax to print in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            explanation: 'printf() is the standard output function in C.',
            options: { create: [
              { text: 'print("Hello")', isCorrect: false, order: 0 },
              { text: 'cout << "Hello"', isCorrect: false, order: 1 },
              { text: 'printf("Hello")', isCorrect: true, order: 2 },
              { text: 'echo "Hello"', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Which data type stores a single character in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: 'int', isCorrect: false, order: 0 },
              { text: 'char', isCorrect: true, order: 1 },
              { text: 'string', isCorrect: false, order: 2 },
              { text: 'byte', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'C is a compiled language.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 3,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which header file is required to use printf in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 4,
            explanation: '#include <stdio.h> provides I/O functions.',
            options: { create: [
              { text: '#include <stdlib.h>', isCorrect: false, order: 0 },
              { text: '#include <stdio.h>', isCorrect: true, order: 1 },
              { text: '#include <math.h>', isCorrect: false, order: 2 },
              { text: '#include <string.h>', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-c-normal',
        title: 'C Programming — Normal',
        desc: 'Intermediate C: pointers, arrays, and memory management.',
        questions: [
          {
            text: 'What does the & operator do when used with a variable in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: '& gives the memory address of a variable.',
            options: { create: [
              { text: 'Adds two variables', isCorrect: false, order: 0 },
              { text: 'Returns the memory address', isCorrect: true, order: 1 },
              { text: 'Declares a reference', isCorrect: false, order: 2 },
              { text: 'Bitwise AND', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is malloc used for in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            options: { create: [
              { text: 'Static memory allocation', isCorrect: false, order: 0 },
              { text: 'Dynamic memory allocation', isCorrect: true, order: 1 },
              { text: 'Freeing memory', isCorrect: false, order: 2 },
              { text: 'Printing memory size', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Arrays in C are zero-indexed.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is a dangling pointer?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 3,
            explanation: 'A dangling pointer points to memory that has been freed.',
            options: { create: [
              { text: 'A pointer with no value', isCorrect: false, order: 0 },
              { text: 'A pointer pointing to freed memory', isCorrect: true, order: 1 },
              { text: 'A null pointer', isCorrect: false, order: 2 },
              { text: 'A double pointer', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'The sizeof operator returns the size of a data type in bytes.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which function is used to copy a string in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 5,
            options: { create: [
              { text: 'strcat()', isCorrect: false, order: 0 },
              { text: 'strcpy()', isCorrect: true, order: 1 },
              { text: 'strcmp()', isCorrect: false, order: 2 },
              { text: 'strdup()', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does free() do in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 6,
            options: { create: [
              { text: 'Allocates memory', isCorrect: false, order: 0 },
              { text: 'Releases dynamically allocated memory', isCorrect: true, order: 1 },
              { text: 'Prints free memory', isCorrect: false, order: 2 },
              { text: 'Initializes a variable', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-c-hard',
        title: 'C Programming — Hard',
        desc: 'Advanced C: function pointers, bit manipulation, and system programming.',
        questions: [
          {
            text: 'What is a function pointer in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 0,
            explanation: 'A function pointer stores the address of a function.',
            options: { create: [
              { text: 'A pointer to a variable', isCorrect: false, order: 0 },
              { text: 'A pointer that stores the address of a function', isCorrect: true, order: 1 },
              { text: 'A return type for functions', isCorrect: false, order: 2 },
              { text: 'A type alias for functions', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does the volatile keyword mean in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 1,
            explanation: 'volatile tells the compiler not to optimize reads/writes — used for hardware registers.',
            options: { create: [
              { text: 'The variable is constant', isCorrect: false, order: 0 },
              { text: 'The variable can change unexpectedly (e.g. hardware)', isCorrect: true, order: 1 },
              { text: 'The variable is thread-safe', isCorrect: false, order: 2 },
              { text: 'The variable is stored in ROM', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'C supports function overloading.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            explanation: 'C does NOT support function overloading — that is a C++ feature.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
          {
            text: 'What is the result of 5 & 3 in C (bitwise AND)?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 3,
            explanation: '5 = 101, 3 = 011 → AND = 001 = 1',
            options: { create: [
              { text: '0', isCorrect: false, order: 0 },
              { text: '1', isCorrect: true, order: 1 },
              { text: '8', isCorrect: false, order: 2 },
              { text: '15', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the difference between struct and union in C?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 4,
            explanation: 'A union shares memory among all members; struct allocates separate memory.',
            options: { create: [
              { text: 'No difference', isCorrect: false, order: 0 },
              { text: 'struct allocates memory per member; union shares one memory location', isCorrect: true, order: 1 },
              { text: 'union is faster for I/O operations', isCorrect: false, order: 2 },
              { text: 'struct can only hold integers', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'In C, a segmentation fault is caused by accessing invalid memory.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which storage class makes a variable persist between function calls?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 6,
            explanation: 'static local variables retain their value across function calls.',
            options: { create: [
              { text: 'extern', isCorrect: false, order: 0 },
              { text: 'register', isCorrect: false, order: 1 },
              { text: 'static', isCorrect: true, order: 2 },
              { text: 'auto', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does #pragma once do?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 7,
            explanation: '#pragma once prevents a header file from being included more than once.',
            options: { create: [
              { text: 'Optimizes code at compile time', isCorrect: false, order: 0 },
              { text: 'Prevents multiple inclusion of a header file', isCorrect: true, order: 1 },
              { text: 'Defines a macro', isCorrect: false, order: 2 },
              { text: 'Marks deprecated code', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
    },
    {
      lang: 'C++',
      simple: {
        id: 'quiz-cpp-simple',
        title: 'C++ Programming — Simple',
        desc: 'Basic C++: OOP basics, cin/cout, and simple classes.',
        questions: [
          {
            text: 'Which keyword is used to define a class in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            options: { create: [
              { text: 'struct', isCorrect: false, order: 0 },
              { text: 'class', isCorrect: true, order: 1 },
              { text: 'object', isCorrect: false, order: 2 },
              { text: 'define', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'C++ supports object-oriented programming.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which operator is used for output in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: '>>', isCorrect: false, order: 0 },
              { text: '<<', isCorrect: true, order: 1 },
              { text: '->', isCorrect: false, order: 2 },
              { text: '::', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the default access specifier for a class in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            explanation: 'In C++ class, default access is private.',
            options: { create: [
              { text: 'public', isCorrect: false, order: 0 },
              { text: 'protected', isCorrect: false, order: 1 },
              { text: 'private', isCorrect: true, order: 2 },
              { text: 'internal', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'cout is defined in which namespace?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 4,
            options: { create: [
              { text: 'std', isCorrect: true, order: 0 },
              { text: 'io', isCorrect: false, order: 1 },
              { text: 'cpp', isCorrect: false, order: 2 },
              { text: 'global', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-cpp-normal',
        title: 'C++ Programming — Normal',
        desc: 'Intermediate C++: inheritance, polymorphism, templates.',
        questions: [
          {
            text: 'What is polymorphism in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: 'Polymorphism means one interface, multiple implementations.',
            options: { create: [
              { text: 'Multiple variables with same name', isCorrect: false, order: 0 },
              { text: 'One interface, multiple behaviors', isCorrect: true, order: 1 },
              { text: 'Copying objects', isCorrect: false, order: 2 },
              { text: 'Memory allocation strategy', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Which keyword enables virtual functions in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            options: { create: [
              { text: 'override', isCorrect: false, order: 0 },
              { text: 'virtual', isCorrect: true, order: 1 },
              { text: 'abstract', isCorrect: false, order: 2 },
              { text: 'interface', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'C++ supports multiple inheritance.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is a constructor in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'A function that destroys objects', isCorrect: false, order: 0 },
              { text: 'A special function called when an object is created', isCorrect: true, order: 1 },
              { text: 'A static method', isCorrect: false, order: 2 },
              { text: 'An overloaded operator', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Templates in C++ allow generic programming.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What does the -> operator do in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 5,
            explanation: '-> accesses members through a pointer.',
            options: { create: [
              { text: 'Dereferences a pointer and accesses a member', isCorrect: true, order: 0 },
              { text: 'Compares two objects', isCorrect: false, order: 1 },
              { text: 'Returns from a function', isCorrect: false, order: 2 },
              { text: 'Assigns a value to pointer', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a destructor in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 6,
            options: { create: [
              { text: 'A function called when an object is destroyed', isCorrect: true, order: 0 },
              { text: 'A function to create objects', isCorrect: false, order: 1 },
              { text: 'A template class', isCorrect: false, order: 2 },
              { text: 'A static method', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-cpp-hard',
        title: 'C++ Programming — Hard',
        desc: 'Advanced C++: STL, move semantics, RAII, and modern C++17/20.',
        questions: [
          {
            text: 'What is RAII in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 0,
            explanation: 'RAII = Resource Acquisition Is Initialization. Resources are tied to object lifetimes.',
            options: { create: [
              { text: 'Random Access Indexed Interface', isCorrect: false, order: 0 },
              { text: 'Resource Acquisition Is Initialization', isCorrect: true, order: 1 },
              { text: 'Runtime Array Index Inspection', isCorrect: false, order: 2 },
              { text: 'Recursive Automated Inline Instantiation', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does std::move() do in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 1,
            explanation: 'std::move() casts to rvalue reference to enable move semantics (avoids copies).',
            options: { create: [
              { text: 'Copies an object to a new location', isCorrect: false, order: 0 },
              { text: 'Casts to rvalue reference enabling move semantics', isCorrect: true, order: 1 },
              { text: 'Deletes an object', isCorrect: false, order: 2 },
              { text: 'Transfers ownership via deep copy', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'std::unique_ptr enforces exclusive ownership of a resource.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which container provides O(1) average lookup time in C++ STL?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 3,
            options: { create: [
              { text: 'std::vector', isCorrect: false, order: 0 },
              { text: 'std::list', isCorrect: false, order: 1 },
              { text: 'std::unordered_map', isCorrect: true, order: 2 },
              { text: 'std::set', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a lambda expression in C++?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 4,
            options: { create: [
              { text: 'A named class method', isCorrect: false, order: 0 },
              { text: 'An inline anonymous function', isCorrect: true, order: 1 },
              { text: 'A template specialization', isCorrect: false, order: 2 },
              { text: 'A compile-time macro', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'constexpr in C++ evaluates expressions at compile time.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the diamond problem in C++ inheritance?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 6,
            explanation: 'When two base classes inherit from the same grandparent, causing ambiguity.',
            options: { create: [
              { text: 'Memory leak from circular references', isCorrect: false, order: 0 },
              { text: 'Ambiguity from multiple inheritance with a common ancestor', isCorrect: true, order: 1 },
              { text: 'STL iterator invalidation', isCorrect: false, order: 2 },
              { text: 'Template instantiation failure', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'std::optional was introduced in which C++ version?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 7,
            options: { create: [
              { text: 'C++11', isCorrect: false, order: 0 },
              { text: 'C++14', isCorrect: false, order: 1 },
              { text: 'C++17', isCorrect: true, order: 2 },
              { text: 'C++20', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
    },
    {
      lang: 'Python',
      simple: {
        id: 'quiz-python-simple',
        title: 'Python Programming — Simple',
        desc: 'Python basics: syntax, data types, and simple programs.',
        questions: [
          {
            text: 'How do you print "Hello World" in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            options: { create: [
              { text: 'echo("Hello World")', isCorrect: false, order: 0 },
              { text: 'print("Hello World")', isCorrect: true, order: 1 },
              { text: 'console.log("Hello World")', isCorrect: false, order: 2 },
              { text: 'printf("Hello World")', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Python uses indentation to define code blocks.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which of the following is a Python list?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: '(1, 2, 3)', isCorrect: false, order: 0 },
              { text: '{1, 2, 3}', isCorrect: false, order: 1 },
              { text: '[1, 2, 3]', isCorrect: true, order: 2 },
              { text: '<1, 2, 3>', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the result of 10 // 3 in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            explanation: '// is floor division. 10 // 3 = 3.',
            options: { create: [
              { text: '3.33', isCorrect: false, order: 0 },
              { text: '3', isCorrect: true, order: 1 },
              { text: '4', isCorrect: false, order: 2 },
              { text: '1', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Python is a dynamically typed language.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-python-normal',
        title: 'Python Programming — Normal',
        desc: 'Intermediate Python: functions, OOP, list comprehensions, exceptions.',
        questions: [
          {
            text: 'What does *args do in a Python function?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: '*args allows passing a variable number of positional arguments.',
            options: { create: [
              { text: 'Passes keyword arguments as a dict', isCorrect: false, order: 0 },
              { text: 'Passes variable number of positional arguments', isCorrect: true, order: 1 },
              { text: 'Makes arguments optional', isCorrect: false, order: 2 },
              { text: 'Unpacks a list', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a list comprehension in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            options: { create: [
              { text: 'A way to import modules', isCorrect: false, order: 0 },
              { text: 'A concise way to create lists using a loop expression', isCorrect: true, order: 1 },
              { text: 'A method of the list class', isCorrect: false, order: 2 },
              { text: 'A data type like tuple', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Python dictionaries maintain insertion order (Python 3.7+).',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What does the @staticmethod decorator do?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'Creates a class-level method with access to self', isCorrect: false, order: 0 },
              { text: 'Creates a method that does not receive self or cls', isCorrect: true, order: 1 },
              { text: 'Freezes a method from being overridden', isCorrect: false, order: 2 },
              { text: 'Adds caching to a method', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Which exception is raised for out-of-range index access in a Python list?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 4,
            options: { create: [
              { text: 'ValueError', isCorrect: false, order: 0 },
              { text: 'IndexError', isCorrect: true, order: 1 },
              { text: 'KeyError', isCorrect: false, order: 2 },
              { text: 'TypeError', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'lambda in Python creates anonymous functions.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the output of len("hello")?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 15, order: 6,
            options: { create: [
              { text: '4', isCorrect: false, order: 0 },
              { text: '5', isCorrect: true, order: 1 },
              { text: '6', isCorrect: false, order: 2 },
              { text: 'Error', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-python-hard',
        title: 'Python Programming — Hard',
        desc: 'Advanced Python: generators, decorators, metaclasses, async/await.',
        questions: [
          {
            text: 'What is a generator in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 0,
            explanation: 'A generator uses yield to lazily produce values one at a time.',
            options: { create: [
              { text: 'A function that returns all values at once as a list', isCorrect: false, order: 0 },
              { text: 'A function using yield to lazily produce values', isCorrect: true, order: 1 },
              { text: 'A built-in class for IO operations', isCorrect: false, order: 2 },
              { text: 'A wrapper for async functions', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does __slots__ do in a Python class?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 1,
            explanation: '__slots__ restricts instance attributes to a fixed list, reducing memory usage.',
            options: { create: [
              { text: 'Defines class methods', isCorrect: false, order: 0 },
              { text: 'Restricts attributes and reduces memory usage', isCorrect: true, order: 1 },
              { text: 'Enables multiple inheritance', isCorrect: false, order: 2 },
              { text: 'Marks the class as immutable', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Python\'s GIL (Global Interpreter Lock) prevents true multi-threading for CPU-bound tasks.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the difference between @classmethod and @staticmethod?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 3,
            explanation: '@classmethod receives cls; @staticmethod receives neither self nor cls.',
            options: { create: [
              { text: 'No difference', isCorrect: false, order: 0 },
              { text: '@classmethod receives cls; @staticmethod receives nothing', isCorrect: true, order: 1 },
              { text: '@staticmethod can access instance variables', isCorrect: false, order: 2 },
              { text: '@classmethod is always faster', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does asyncio.gather() do?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 4,
            options: { create: [
              { text: 'Collects all exceptions from async tasks', isCorrect: false, order: 0 },
              { text: 'Runs multiple coroutines concurrently', isCorrect: true, order: 1 },
              { text: 'Synchronously executes async functions', isCorrect: false, order: 2 },
              { text: 'Creates an event loop', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a metaclass in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 5,
            explanation: 'A metaclass is the "class of a class" — it defines how classes behave.',
            options: { create: [
              { text: 'A class that inherits from multiple parents', isCorrect: false, order: 0 },
              { text: 'The class of a class, controlling class creation', isCorrect: true, order: 1 },
              { text: 'An abstract base class', isCorrect: false, order: 2 },
              { text: 'A design pattern for singletons', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'functools.lru_cache is used for memoization in Python.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 6,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which module provides tools for working with iterators in Python?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 20, order: 7,
            options: { create: [
              { text: 'collections', isCorrect: false, order: 0 },
              { text: 'itertools', isCorrect: true, order: 1 },
              { text: 'functools', isCorrect: false, order: 2 },
              { text: 'builtins', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
    },
    {
      lang: 'Java',
      simple: {
        id: 'quiz-java-simple',
        title: 'Java Programming — Simple',
        desc: 'Basic Java: syntax, types, OOP foundations.',
        questions: [
          {
            text: 'Java is platform-independent due to which component?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: 'The JVM (Java Virtual Machine) enables platform independence.',
            options: { create: [
              { text: 'JDK', isCorrect: false, order: 0 },
              { text: 'JVM', isCorrect: true, order: 1 },
              { text: 'JRE', isCorrect: false, order: 2 },
              { text: 'Compiler', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Java supports multiple inheritance through classes.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            explanation: 'Java does NOT support multiple class inheritance but does through interfaces.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
          {
            text: 'Which method is the entry point of every Java program?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: 'start()', isCorrect: false, order: 0 },
              { text: 'run()', isCorrect: false, order: 1 },
              { text: 'main()', isCorrect: true, order: 2 },
              { text: 'init()', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What keyword is used to inherit a class in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'implements', isCorrect: false, order: 0 },
              { text: 'extends', isCorrect: true, order: 1 },
              { text: 'inherits', isCorrect: false, order: 2 },
              { text: 'super', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'In Java, String is a primitive data type.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            explanation: 'String is a class (reference type) in Java, not a primitive.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-java-normal',
        title: 'Java Programming — Normal',
        desc: 'Intermediate Java: collections, generics, exception handling.',
        questions: [
          {
            text: 'What is the difference between ArrayList and LinkedList in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 0,
            explanation: 'ArrayList uses dynamic arrays; LinkedList uses doubly-linked nodes.',
            options: { create: [
              { text: 'ArrayList is faster for insertion; LinkedList for random access', isCorrect: false, order: 0 },
              { text: 'ArrayList uses arrays; LinkedList uses linked nodes', isCorrect: true, order: 1 },
              { text: 'They are identical', isCorrect: false, order: 2 },
              { text: 'LinkedList cannot store objects', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does the final keyword mean when applied to a variable?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            options: { create: [
              { text: 'The variable is public', isCorrect: false, order: 0 },
              { text: 'The variable cannot be reassigned', isCorrect: true, order: 1 },
              { text: 'The variable is global', isCorrect: false, order: 2 },
              { text: 'The variable is null by default', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Java checked exceptions must be caught or declared in the method signature.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is autoboxing in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'Converting a primitive to its wrapper class automatically', isCorrect: true, order: 0 },
              { text: 'Creating array boxes for primitives', isCorrect: false, order: 1 },
              { text: 'Garbage collection of objects', isCorrect: false, order: 2 },
              { text: 'Boxing exceptions into error codes', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'HashMap in Java allows null keys.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which Java interface must be implemented to use objects in a TreeSet?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 5,
            options: { create: [
              { text: 'Serializable', isCorrect: false, order: 0 },
              { text: 'Comparable', isCorrect: true, order: 1 },
              { text: 'Iterable', isCorrect: false, order: 2 },
              { text: 'Cloneable', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does the synchronized keyword do in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 6,
            options: { create: [
              { text: 'Speeds up method execution', isCorrect: false, order: 0 },
              { text: 'Ensures only one thread executes the method at a time', isCorrect: true, order: 1 },
              { text: 'Makes a method asynchronous', isCorrect: false, order: 2 },
              { text: 'Syncs with an external database', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-java-hard',
        title: 'Java Programming — Hard',
        desc: 'Advanced Java: streams, concurrency, JVM internals, design patterns.',
        questions: [
          {
            text: 'What is the purpose of Java Stream API?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 0,
            options: { create: [
              { text: 'For network IO operations', isCorrect: false, order: 0 },
              { text: 'For functional-style operations on collections', isCorrect: true, order: 1 },
              { text: 'For file streaming only', isCorrect: false, order: 2 },
              { text: 'For multi-threaded execution', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the difference between CompletableFuture and Future in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 1,
            explanation: 'CompletableFuture supports chaining and callbacks; Future only has blocking get().',
            options: { create: [
              { text: 'No difference', isCorrect: false, order: 0 },
              { text: 'CompletableFuture supports chaining/callbacks; Future is blocking', isCorrect: true, order: 1 },
              { text: 'CompletableFuture is slower', isCorrect: false, order: 2 },
              { text: 'Future is newer than CompletableFuture', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Java uses stop-the-world garbage collection exclusively.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            explanation: 'Modern JVMs use concurrent GC (G1, ZGC) that minimizes stop-the-world pauses.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
          {
            text: 'What is the Singleton design pattern?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 3,
            options: { create: [
              { text: 'Ensures a class has only one instance', isCorrect: true, order: 0 },
              { text: 'Creates multiple instances from one template', isCorrect: false, order: 1 },
              { text: 'Wraps another object for added functionality', isCorrect: false, order: 2 },
              { text: 'Separates object creation from usage', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does volatile ensure in Java multithreading?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 4,
            explanation: 'volatile ensures visibility of changes to a variable across threads.',
            options: { create: [
              { text: 'Atomic operations on the variable', isCorrect: false, order: 0 },
              { text: 'Changes are visible across all threads immediately', isCorrect: true, order: 1 },
              { text: 'Thread-safe collections', isCorrect: false, order: 2 },
              { text: 'Prevention of deadlocks', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Java records (Java 16+) are immutable data classes.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which Java memory area stores class-level (static) variables?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 6,
            options: { create: [
              { text: 'Stack', isCorrect: false, order: 0 },
              { text: 'Heap', isCorrect: false, order: 1 },
              { text: 'Metaspace / Method Area', isCorrect: true, order: 2 },
              { text: 'Code Cache', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a functional interface in Java?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 20, order: 7,
            explanation: 'A functional interface has exactly one abstract method. Used with lambdas.',
            options: { create: [
              { text: 'An interface with no methods', isCorrect: false, order: 0 },
              { text: 'An interface with exactly one abstract method', isCorrect: true, order: 1 },
              { text: 'An interface that extends Runnable', isCorrect: false, order: 2 },
              { text: 'An interface for mathematical functions only', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
    },
    {
      lang: 'JavaScript',
      simple: {
        id: 'quiz-js-simple',
        title: 'JavaScript — Simple',
        desc: 'Core JavaScript basics for beginners.',
        questions: [
          {
            text: 'What does typeof null return in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            explanation: 'typeof null returns "object" — a famous JavaScript quirk.',
            options: { create: [
              { text: '"null"', isCorrect: false, order: 0 },
              { text: '"undefined"', isCorrect: false, order: 1 },
              { text: '"object"', isCorrect: true, order: 2 },
              { text: '"string"', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'JavaScript can run in both browser and server environments.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which method adds an element to the END of an array?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: 'unshift()', isCorrect: false, order: 0 },
              { text: 'push()', isCorrect: true, order: 1 },
              { text: 'append()', isCorrect: false, order: 2 },
              { text: 'add()', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is NaN in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'null', isCorrect: false, order: 0 },
              { text: 'Not a Number — result of invalid numeric operation', isCorrect: true, order: 1 },
              { text: 'A network error type', isCorrect: false, order: 2 },
              { text: 'Negative absolute number', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'undefined and null are the same in JavaScript.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            explanation: 'undefined means a variable was declared but not assigned; null is an intentional empty value.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-js-normal',
        title: 'JavaScript — Normal',
        desc: 'ES6+, closures, async/await, and DOM manipulation.',
        questions: [
          {
            text: 'What is a closure in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 0,
            explanation: 'A closure is a function that retains access to its outer scope after the outer function returns.',
            options: { create: [
              { text: 'A way to close a browser window', isCorrect: false, order: 0 },
              { text: 'A function with access to its outer scope', isCorrect: true, order: 1 },
              { text: 'A type of loop', isCorrect: false, order: 2 },
              { text: 'An event listener', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does the spread operator (...) do?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 1,
            options: { create: [
              { text: 'Multiplies array elements', isCorrect: false, order: 0 },
              { text: 'Expands an iterable into individual elements', isCorrect: true, order: 1 },
              { text: 'Declares a rest parameter', isCorrect: false, order: 2 },
              { text: 'Concatenates strings', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Arrow functions have their own "this" context.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 2,
            explanation: 'Arrow functions do NOT have their own "this" — they inherit from the enclosing scope.',
            options: { create: [
              { text: 'True', isCorrect: false, order: 0 },
              { text: 'False', isCorrect: true, order: 1 },
            ]},
          },
          {
            text: 'What does Promise.all() do?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'Runs promises sequentially', isCorrect: false, order: 0 },
              { text: 'Waits for all promises to resolve (or any to reject)', isCorrect: true, order: 1 },
              { text: 'Cancels all pending promises', isCorrect: false, order: 2 },
              { text: 'Returns the first resolved promise', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is event delegation in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 4,
            options: { create: [
              { text: 'Triggering events programmatically', isCorrect: false, order: 0 },
              { text: 'Attaching one listener to a parent to handle child events via bubbling', isCorrect: true, order: 1 },
              { text: 'Delegating events to Web Workers', isCorrect: false, order: 2 },
              { text: 'Preventing default browser events', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'let and const are hoisted but NOT initialized — accessing them before declaration causes a ReferenceError.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the Temporal Dead Zone (TDZ)?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 25, order: 6,
            explanation: 'TDZ is the time between variable declaration hoisting and initialization where access throws ReferenceError.',
            options: { create: [
              { text: 'A browser API for time operations', isCorrect: false, order: 0 },
              { text: 'The period where let/const are hoisted but not yet initialized', isCorrect: true, order: 1 },
              { text: 'A deprecated async pattern', isCorrect: false, order: 2 },
              { text: 'A memory allocation zone', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-js-hard',
        title: 'JavaScript — Hard',
        desc: 'Expert JS: prototype chain, event loop, design patterns, V8 internals.',
        questions: [
          {
            text: 'What is the prototype chain in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 0,
            explanation: 'JavaScript objects look up properties in a chain of prototypes until null is reached.',
            options: { create: [
              { text: 'A list of all functions in an object', isCorrect: false, order: 0 },
              { text: 'A series of linked objects for property lookup', isCorrect: true, order: 1 },
              { text: 'The DOM tree hierarchy', isCorrect: false, order: 2 },
              { text: 'The scope chain for closures', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the event loop in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 1,
            options: { create: [
              { text: 'A loop for handling DOM events', isCorrect: false, order: 0 },
              { text: 'A mechanism that handles async callbacks using the call stack and task queue', isCorrect: true, order: 1 },
              { text: 'A web API for animation frames', isCorrect: false, order: 2 },
              { text: 'A Node.js-specific feature', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Microtasks (like Promise callbacks) run BEFORE macrotasks (like setTimeout).',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is Object.create(null) useful for?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 3,
            explanation: 'Object.create(null) creates an object with NO prototype — useful for pure dictionaries.',
            options: { create: [
              { text: 'Creating a frozen object', isCorrect: false, order: 0 },
              { text: 'Creating an object with no prototype (pure dictionary)', isCorrect: true, order: 1 },
              { text: 'Deleting an object', isCorrect: false, order: 2 },
              { text: 'Cloning an object deeply', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is a WeakMap in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 4,
            explanation: 'WeakMap holds weak references to keys (objects) — GC can collect them.',
            options: { create: [
              { text: 'A Map with faster lookup', isCorrect: false, order: 0 },
              { text: 'A Map where keys are weakly referenced (GC can collect them)', isCorrect: true, order: 1 },
              { text: 'A Map with string-only keys', isCorrect: false, order: 2 },
              { text: 'An immutable Map', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What does Symbol.iterator define on an object?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 5,
            explanation: 'Symbol.iterator makes an object iterable (for...of, spread).',
            options: { create: [
              { text: 'The default string representation', isCorrect: false, order: 0 },
              { text: 'The iteration protocol making the object iterable', isCorrect: true, order: 1 },
              { text: 'A unique property name', isCorrect: false, order: 2 },
              { text: 'A comparison method', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'V8 uses JIT (Just-In-Time) compilation to optimize JavaScript execution.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 6,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the purpose of Proxy in JavaScript?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 7,
            options: { create: [
              { text: 'To create deep copies of objects', isCorrect: false, order: 0 },
              { text: 'To intercept and customize operations on objects', isCorrect: true, order: 1 },
              { text: 'To define prototype chains', isCorrect: false, order: 2 },
              { text: 'To route network requests', isCorrect: false, order: 3 },
            ]},
          },
        ],
      },
    },
    {
      lang: 'Spring Boot',
      simple: {
        id: 'quiz-springboot-simple',
        title: 'Spring Boot — Simple',
        desc: 'Spring Boot basics: annotations, REST, and auto-configuration.',
        questions: [
          {
            text: 'Which annotation marks a class as a Spring Boot application entry point?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            options: { create: [
              { text: '@SpringComponent', isCorrect: false, order: 0 },
              { text: '@SpringBootApplication', isCorrect: true, order: 1 },
              { text: '@EnableSpring', isCorrect: false, order: 2 },
              { text: '@Application', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Spring Boot can automatically configure your application based on classpath dependencies.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'Which annotation creates a REST controller in Spring Boot?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: '@Controller', isCorrect: false, order: 0 },
              { text: '@RestController', isCorrect: true, order: 1 },
              { text: '@APIController', isCorrect: false, order: 2 },
              { text: '@WebController', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What file is commonly used for Spring Boot configuration?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: 'config.xml', isCorrect: false, order: 0 },
              { text: 'application.properties or application.yml', isCorrect: true, order: 1 },
              { text: 'spring.json', isCorrect: false, order: 2 },
              { text: 'settings.gradle', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: '@Autowired in Spring performs dependency injection.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
      normal: {
        id: 'quiz-springboot-normal',
        title: 'Spring Boot — Normal',
        desc: 'Intermediate Spring: JPA, security, services, and repositories.',
        questions: [
          {
            text: 'What is the purpose of @Repository in Spring?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 0,
            options: { create: [
              { text: 'Marks a class as a web controller', isCorrect: false, order: 0 },
              { text: 'Marks a class as a data access layer component', isCorrect: true, order: 1 },
              { text: 'Creates a singleton bean', isCorrect: false, order: 2 },
              { text: 'Configures database connections', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Spring Data JPA extends JpaRepository to generate CRUD operations automatically.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 1,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What HTTP status code does @ResponseStatus(HttpStatus.CREATED) map to?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 2,
            options: { create: [
              { text: '200', isCorrect: false, order: 0 },
              { text: '201', isCorrect: true, order: 1 },
              { text: '204', isCorrect: false, order: 2 },
              { text: '400', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Which annotation marks a Spring service class?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 3,
            options: { create: [
              { text: '@Component', isCorrect: false, order: 0 },
              { text: '@Service', isCorrect: true, order: 1 },
              { text: '@Bean', isCorrect: false, order: 2 },
              { text: '@Entity', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: '@Transactional ensures database operations run in a single transaction.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 4,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What does @PathVariable do in a Spring REST endpoint?',
            type: 'MULTIPLE_CHOICE' as const, points: 100, timeLimit: 20, order: 5,
            options: { create: [
              { text: 'Maps query parameters to method arguments', isCorrect: false, order: 0 },
              { text: 'Binds a URI template variable to a method parameter', isCorrect: true, order: 1 },
              { text: 'Validates request body', isCorrect: false, order: 2 },
              { text: 'Injects environment variables', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Spring Security is NOT included in Spring Boot starter web by default.',
            type: 'TRUE_FALSE' as const, points: 100, timeLimit: 15, order: 6,
            explanation: 'You must add spring-boot-starter-security separately.',
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
      hard: {
        id: 'quiz-springboot-hard',
        title: 'Spring Boot — Hard',
        desc: 'Advanced Spring: AOP, reactive, microservices, and performance tuning.',
        questions: [
          {
            text: 'What is AOP (Aspect-Oriented Programming) in Spring?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 0,
            explanation: 'AOP separates cross-cutting concerns (logging, security) from business logic using aspects.',
            options: { create: [
              { text: 'A way to write asynchronous code', isCorrect: false, order: 0 },
              { text: 'A technique to modularize cross-cutting concerns using aspects', isCorrect: true, order: 1 },
              { text: 'An API design pattern', isCorrect: false, order: 2 },
              { text: 'A database transaction strategy', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is Spring WebFlux used for?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 1,
            options: { create: [
              { text: 'Building traditional MVC web apps', isCorrect: false, order: 0 },
              { text: 'Reactive, non-blocking web applications', isCorrect: true, order: 1 },
              { text: 'Batch processing jobs', isCorrect: false, order: 2 },
              { text: 'WebSocket-only applications', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Spring Boot Actuator exposes endpoints for monitoring and management.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 2,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is the difference between @Bean and @Component?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 3,
            explanation: '@Bean is method-level in @Configuration; @Component is class-level for auto-scan.',
            options: { create: [
              { text: 'No functional difference', isCorrect: false, order: 0 },
              { text: '@Bean is method-level in config class; @Component is class-level for scanning', isCorrect: true, order: 1 },
              { text: '@Component creates prototype beans; @Bean creates singletons', isCorrect: false, order: 2 },
              { text: '@Bean requires XML configuration', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'What is the N+1 problem in JPA and how is it solved?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 30, order: 4,
            explanation: 'N+1: fetching N entities issues N extra queries for associations. Solved with JOIN FETCH or @BatchSize.',
            options: { create: [
              { text: 'Pagination issue solved by @PageRequest', isCorrect: false, order: 0 },
              { text: 'Lazy loading causing N extra queries; solved with JOIN FETCH or batch fetch', isCorrect: true, order: 1 },
              { text: 'Connection pool exhaustion', isCorrect: false, order: 2 },
              { text: 'Transaction rollback issue', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: 'Spring Cloud Config enables externalized configuration for microservices.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 5,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
          {
            text: 'What is a Circuit Breaker pattern in microservices?',
            type: 'MULTIPLE_CHOICE' as const, points: 150, timeLimit: 25, order: 6,
            explanation: 'Circuit Breaker stops cascading failures by short-circuiting calls to failing services.',
            options: { create: [
              { text: 'A method to encrypt service communication', isCorrect: false, order: 0 },
              { text: 'A pattern that stops cascading failures by short-circuiting failing calls', isCorrect: true, order: 1 },
              { text: 'A load balancing technique', isCorrect: false, order: 2 },
              { text: 'A database sharding strategy', isCorrect: false, order: 3 },
            ]},
          },
          {
            text: '@Cacheable in Spring stores method results so repeated calls hit the cache.',
            type: 'TRUE_FALSE' as const, points: 150, timeLimit: 15, order: 7,
            options: { create: [
              { text: 'True', isCorrect: true, order: 0 },
              { text: 'False', isCorrect: false, order: 1 },
            ]},
          },
        ],
      },
    },
  ]

  for (const lang of LANGS) {
    const levels = [
      { data: lang.simple, level: 'SIMPLE' as const },
      { data: lang.normal, level: 'NORMAL' as const },
      { data: lang.hard, level: 'HARD' as const },
    ]
    for (const { data, level } of levels) {
      const totalPoints = data.questions.reduce((s, q) => s + q.points, 0)
      await prisma.quiz.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          title: data.title,
          description: data.desc,
          category: 'Programming',
          language: lang.lang,
          level,
          visibility: 'PUBLIC',
          timePerQ: level === 'HARD' ? 30 : level === 'NORMAL' ? 25 : 20,
          totalPoints,
          passPercent: 60,
          creatorId: admin.id,
          questions: { create: data.questions },
        },
      })
      console.log(`  ✅ Seeded: ${data.title}`)
    }
  }

  console.log('\n🎉 Database seeded successfully!')
  console.log('   Admin:   admin@quizdaw.com / admin123')
  console.log('   Creator: creator@quizdaw.com / creator123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
