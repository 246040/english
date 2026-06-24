// quiz-data.js
// Assessment & Diagnostic Quiz Questions for EnglishBuddy
// 3 difficulty levels × 10 questions = 30 total questions

export const quizData = {
  // ============================================================
  // Level 1: 小学/初一基础 (Elementary / Grade 7 basics)
  // Very basic vocabulary recognition
  // ============================================================
  level1: [
    {
      id: 'q1',
      level: 1,
      type: 'vocab-en2cn',
      question: 'What does "apple" mean?',
      questionCn: '"apple" 是什么意思？',
      options: ['苹果', '香蕉', '橘子', '西瓜'],
      correctIndex: 0,
      explanation: 'apple 是苹果的意思。An apple a day keeps the doctor away. 一天一个苹果，医生远离我。'
    },
    {
      id: 'q2',
      level: 1,
      type: 'vocab-cn2en',
      question: '"学校" 用英语怎么说？',
      questionCn: '请选择"学校"的英文：',
      options: ['school', 'student', 'teacher', 'book'],
      correctIndex: 0,
      explanation: 'school 是学校的意思。I go to school every day. 我每天去上学。'
    },
    {
      id: 'q3',
      level: 1,
      type: 'vocab-en2cn',
      question: 'What does "water" mean?',
      questionCn: '"water" 是什么意思？',
      options: ['牛奶', '果汁', '水', '茶'],
      correctIndex: 2,
      explanation: 'water 是水的意思。Can I have some water? 我能喝点水吗？'
    },
    {
      id: 'q4',
      level: 1,
      type: 'vocab-cn2en',
      question: '"朋友" 用英语怎么说？',
      questionCn: '请选择"朋友"的英文：',
      options: ['family', 'father', 'friend', 'food'],
      correctIndex: 2,
      explanation: 'friend 是朋友的意思。He is my best friend. 他是我最好的朋友。'
    },
    {
      id: 'q5',
      level: 1,
      type: 'vocab-en2cn',
      question: 'What does "big" mean?',
      questionCn: '"big" 是什么意思？',
      options: ['小的', '高的', '大的', '长的'],
      correctIndex: 2,
      explanation: 'big 是大的意思。Our school is very big. 我们学校很大。'
    },
    {
      id: 'q6',
      level: 1,
      type: 'vocab-cn2en',
      question: '"母亲" 用英语怎么说？',
      questionCn: '请选择"母亲"的英文：',
      options: ['sister', 'mother', 'brother', 'father'],
      correctIndex: 1,
      explanation: 'mother 是母亲、妈妈的意思。My mother is a teacher. 我妈妈是一位老师。'
    },
    {
      id: 'q7',
      level: 1,
      type: 'vocab-en2cn',
      question: 'What does "eat" mean?',
      questionCn: '"eat" 是什么意思？',
      options: ['喝', '看', '吃', '走'],
      correctIndex: 2,
      explanation: 'eat 是吃的意思。I eat breakfast at seven. 我七点吃早饭。'
    },
    {
      id: 'q8',
      level: 1,
      type: 'vocab-cn2en',
      question: '"好的" 用英语怎么说？',
      questionCn: '请选择"好的"的英文：',
      options: ['bad', 'big', 'good', 'go'],
      correctIndex: 2,
      explanation: 'good 是好的意思。She is a good student. 她是一个好学生。'
    },
    {
      id: 'q9',
      level: 1,
      type: 'vocab-en2cn',
      question: 'What does "book" mean?',
      questionCn: '"book" 是什么意思？',
      options: ['笔', '书', '桌子', '书包'],
      correctIndex: 1,
      explanation: 'book 是书的意思。This is my English book. 这是我的英语书。'
    },
    {
      id: 'q10',
      level: 1,
      type: 'vocab-cn2en',
      question: '"喜欢" 用英语怎么说？',
      questionCn: '请选择"喜欢"的英文：',
      options: ['look', 'like', 'live', 'love'],
      correctIndex: 1,
      explanation: 'like 是喜欢的意思。I like English very much. 我非常喜欢英语。'
    }
  ],

  // ============================================================
  // Level 2: 初一水平 (Grade 7 level)
  // Vocab + basic grammar (be verbs, simple present/past)
  // ============================================================
  level2: [
    {
      id: 'q11',
      level: 2,
      type: 'vocab-en2cn',
      question: 'What does "vacation" mean?',
      questionCn: '"vacation" 是什么意思？',
      options: ['作业', '假期', '旅行', '周末'],
      correctIndex: 1,
      explanation: 'vacation 是假期的意思。Where did you go on vacation? 你假期去了哪里？'
    },
    {
      id: 'q12',
      level: 2,
      type: 'vocab-cn2en',
      question: '"无聊的" 用英语怎么说？',
      questionCn: '请选择"无聊的"的英文：',
      options: ['beautiful', 'boring', 'busy', 'bright'],
      correctIndex: 1,
      explanation: 'boring 是无聊的意思。The movie was so boring. 这部电影太无聊了。'
    },
    {
      id: 'q13',
      level: 2,
      type: 'grammar',
      question: 'She _____ to school every day.',
      questionCn: '选择正确的动词形式填空：',
      options: ['go', 'goes', 'going', 'went'],
      correctIndex: 1,
      explanation: '主语是 she（第三人称单数），一般现在时动词要加 -s 或 -es，所以用 goes。'
    },
    {
      id: 'q14',
      level: 2,
      type: 'grammar',
      question: 'They _____ very happy yesterday.',
      questionCn: '选择正确的 be 动词形式：',
      options: ['are', 'is', 'was', 'were'],
      correctIndex: 3,
      explanation: '主语是 they（复数），时间是 yesterday（过去），所以用 were。'
    },
    {
      id: 'q15',
      level: 2,
      type: 'vocab-cn2en',
      question: '"决定" 用英语怎么说？',
      questionCn: '请选择"决定"的英文：',
      options: ['discuss', 'decide', 'describe', 'develop'],
      correctIndex: 1,
      explanation: 'decide 是决定的意思。We decided to go to the beach. 我们决定去海滩。'
    },
    {
      id: 'q16',
      level: 2,
      type: 'grammar',
      question: 'I _____ to the movies last weekend.',
      questionCn: '选择正确的动词形式填空：',
      options: ['go', 'goes', 'went', 'going'],
      correctIndex: 2,
      explanation: '时间是 last weekend（上周末），表示过去发生的事，用一般过去时，go 的过去式是 went。'
    },
    {
      id: 'q17',
      level: 2,
      type: 'vocab-en2cn',
      question: 'What does "diary" mean?',
      questionCn: '"diary" 是什么意思？',
      options: ['字典', '日记', '故事书', '报纸'],
      correctIndex: 1,
      explanation: 'diary 是日记的意思。I wrote a diary every day. 我每天都写日记。'
    },
    {
      id: 'q18',
      level: 2,
      type: 'grammar',
      question: '_____ she like English?',
      questionCn: '选择正确的助动词：',
      options: ['Do', 'Does', 'Is', 'Are'],
      correctIndex: 1,
      explanation: '主语是 she（第三人称单数），一般现在时的疑问句要用助动词 Does。'
    },
    {
      id: 'q19',
      level: 2,
      type: 'vocab-cn2en',
      question: '"精彩的" 用英语怎么说？',
      questionCn: '请选择"精彩的"的英文：',
      options: ['wonderful', 'weather', 'welcome', 'weekend'],
      correctIndex: 0,
      explanation: 'wonderful 是精彩的、极好的意思。We had a wonderful time. 我们玩得很开心。'
    },
    {
      id: 'q20',
      level: 2,
      type: 'grammar',
      question: 'There _____ a book on the desk.',
      questionCn: '选择正确的 be 动词：',
      options: ['are', 'is', 'am', 'were'],
      correctIndex: 1,
      explanation: 'a book 是单数，一般现在时用 is。There is a book on the desk. 桌上有一本书。'
    }
  ],

  // ============================================================
  // Level 3: 初二水平 (Grade 8 level)
  // Advanced vocab + grammar + cloze (形容词比较级/最高级，频率副词等)
  // ============================================================
  level3: [
    {
      id: 'q21',
      level: 3,
      type: 'vocab-en2cn',
      question: 'What does "outgoing" mean?',
      questionCn: '"outgoing" 是什么意思？',
      options: ['外向的', '安静的', '认真的', '懒惰的'],
      correctIndex: 0,
      explanation: "outgoing 是外向的意思。I'm more outgoing than my sister. 我比我姐姐更外向。"
    },
    {
      id: 'q22',
      level: 3,
      type: 'grammar',
      question: 'Tom is _____ than his brother.',
      questionCn: '选择正确的比较级形式：',
      options: ['tall', 'taller', 'tallest', 'more tall'],
      correctIndex: 1,
      explanation: '两者比较用比较级，tall 是单音节词，直接加 -er 变成 taller。than 是比较级的标志词。'
    },
    {
      id: 'q23',
      level: 3,
      type: 'cloze',
      question: 'I _____ ever watch TV because I am too busy with homework.',
      questionCn: '根据句意选择正确的频率副词：',
      options: ['always', 'usually', 'hardly', 'often'],
      correctIndex: 2,
      explanation: 'hardly ever 表示"几乎不"，因为太忙所以几乎不看电视。hardly ever 是本单元重点短语。'
    },
    {
      id: 'q24',
      level: 3,
      type: 'grammar',
      question: 'This is _____ movie theater in town.',
      questionCn: '选择正确的最高级形式：',
      options: ['good', 'better', 'the best', 'the better'],
      correctIndex: 2,
      explanation: '三者或三者以上比较用最高级。good 的最高级是 best，最高级前要加 the。'
    },
    {
      id: 'q25',
      level: 3,
      type: 'vocab-en2cn',
      question: 'What does "comfortable" mean?',
      questionCn: '"comfortable" 是什么意思？',
      options: ['便宜的', '舒适的', '安全的', '美丽的'],
      correctIndex: 1,
      explanation: 'comfortable 是舒适的意思。It has the most comfortable seats. 它有最舒适的座位。'
    },
    {
      id: 'q26',
      level: 3,
      type: 'cloze',
      question: 'I exercise _____ a week, on Monday and Friday.',
      questionCn: '根据句意选择正确的频率词：',
      options: ['once', 'twice', 'three times', 'never'],
      correctIndex: 1,
      explanation: '周一和周五锻炼，一共两次，所以用 twice（两次）。once 一次，twice 两次，three times 三次。'
    },
    {
      id: 'q27',
      level: 3,
      type: 'grammar',
      question: 'She sings _____ than anyone else in our class.',
      questionCn: '选择正确的比较级形式：',
      options: ['beautiful', 'more beautiful', 'more beautifully', 'most beautifully'],
      correctIndex: 2,
      explanation: '修饰动词 sings 要用副词 beautifully。两者比较用比较级 more beautifully。注意区分形容词和副词。'
    },
    {
      id: 'q28',
      level: 3,
      type: 'cloze',
      question: 'Mickey Mouse first _____ in the cartoon Steamboat Willie in 1928.',
      questionCn: '根据句意选择正确的动词：',
      options: ['appears', 'appeared', 'appearing', 'appear'],
      correctIndex: 1,
      explanation: '1928年是过去的时间，用一般过去时。appear 的过去式是 appeared。'
    },
    {
      id: 'q29',
      level: 3,
      type: 'vocab-en2cn',
      question: 'What does "educational" mean?',
      questionCn: '"educational" 是什么意思？',
      options: ['有趣的', '无聊的', '有教育意义的', '流行的'],
      correctIndex: 2,
      explanation: 'educational 是有教育意义的意思。I think game shows are educational. 我觉得游戏节目有教育意义。'
    },
    {
      id: 'q30',
      level: 3,
      type: 'grammar',
      question: '_____ she is short, she is good at basketball.',
      questionCn: '选择正确的连词：',
      options: ['Because', 'Although', 'So', 'But'],
      correctIndex: 1,
      explanation: 'although 表示"虽然……但是……"，引导让步状语从句。注意：although 和 but 不能同时使用。'
    }
  ]
};

// ============================================================
// Quiz metadata for level selection UI
// ============================================================
export const quizLevelInfo = [
  {
    level: 1,
    name: '基础测试',
    nameEn: 'Basic Level',
    description: '小学及初一基础词汇，检测你是否掌握最基本的英语单词',
    icon: '⭐',
    questionCount: 10,
    estimatedMinutes: 5
  },
  {
    level: 2,
    name: '进阶测试',
    nameEn: 'Intermediate Level',
    description: '初一水平词汇与基础语法（be动词、一般现在时、一般过去时）',
    icon: '⭐⭐',
    questionCount: 10,
    estimatedMinutes: 8
  },
  {
    level: 3,
    name: '挑战测试',
    nameEn: 'Advanced Level',
    description: '初二水平词汇与语法（比较级、最高级、频率副词、完形填空）',
    icon: '⭐⭐⭐',
    questionCount: 10,
    estimatedMinutes: 10
  }
];
