/**
 * Grammar Data - PEP Grade 8 Upper 语法专项练习数据
 * 6个语法专题，共70道题
 */

export const grammarTopics = [
    {
        id: 'past-tense',
        name: '一般过去时',
        nameEn: 'Simple Past Tense',
        icon: '⏰',
        description: '讲述过去发生的事情',
        questionCount: 15,
        difficulty: 1
    },
    {
        id: 'adverbs-frequency',
        name: '频率副词',
        nameEn: 'Adverbs of Frequency',
        icon: '🔄',
        description: '表示做事的频率',
        questionCount: 10,
        difficulty: 1
    },
    {
        id: 'comparative',
        name: '形容词比较级',
        nameEn: 'Comparative Adjectives',
        icon: '📊',
        description: '两者之间的比较',
        questionCount: 15,
        difficulty: 2
    },
    {
        id: 'superlative',
        name: '形容词最高级',
        nameEn: 'Superlative Adjectives',
        icon: '🏆',
        description: '三者或以上的比较',
        questionCount: 10,
        difficulty: 2
    },
    {
        id: 'infinitive',
        name: '动词不定式',
        nameEn: 'Infinitives',
        icon: '🎯',
        description: 'to do 的用法',
        questionCount: 10,
        difficulty: 2
    },
    {
        id: 'be-going-to',
        name: 'be going to 将来时',
        nameEn: 'Be Going To',
        icon: '🚀',
        description: '表达计划和打算',
        questionCount: 10,
        difficulty: 1
    }
];

export const grammarQuestions = {
    'past-tense': [
        {
            id: 'g1_01', topicId: 'past-tense', type: 'fill-blank',
            question: 'I ___ (go) to Beijing last summer.',
            questionCn: '去年夏天我___北京了。',
            options: ['go', 'went', 'goes', 'going'],
            correctIndex: 1,
            explanation: '一般过去时用动词过去式。go的过去式是went。',
            tip: '时间标志词：last summer（去年夏天）→ 用过去时'
        },
        {
            id: 'g1_02', topicId: 'past-tense', type: 'fill-blank',
            question: 'She ___ (eat) breakfast at 7:00 yesterday.',
            questionCn: '她昨天7点___早餐。',
            options: ['eat', 'eats', 'ate', 'eating'],
            correctIndex: 2,
            explanation: 'eat的过去式是ate（不规则变化）。',
            tip: '时间标志词：yesterday（昨天）→ 用过去时'
        },
        {
            id: 'g1_03', topicId: 'past-tense', type: 'fill-blank',
            question: 'We ___ (see) a movie last night.',
            questionCn: '我们昨晚___了一部电影。',
            options: ['see', 'saw', 'seen', 'sees'],
            correctIndex: 1,
            explanation: 'see的过去式是saw。',
            tip: '时间标志词：last night（昨晚）→ 用过去时'
        },
        {
            id: 'g1_04', topicId: 'past-tense', type: 'fill-blank',
            question: 'He ___ (buy) a new phone last week.',
            questionCn: '他上周___了一部新手机。',
            options: ['buy', 'buys', 'bought', 'buying'],
            correctIndex: 2,
            explanation: 'buy的过去式是bought。',
            tip: '时间标志词：last week（上周）→ 用过去时'
        },
        {
            id: 'g1_05', topicId: 'past-tense', type: 'fill-blank',
            question: 'They ___ (play) basketball after school yesterday.',
            questionCn: '他们昨天放学后___篮球了。',
            options: ['play', 'played', 'plays', 'playing'],
            correctIndex: 1,
            explanation: 'play是规则动词，过去式加-ed → played。',
            tip: '规则动词过去式：直接加-ed'
        },
        {
            id: 'g1_06', topicId: 'past-tense', type: 'choose',
            question: 'I ___ not go to school yesterday because I was sick.',
            questionCn: '我昨天没去上学，因为我生病了。',
            options: ['do', 'did', 'does', 'was'],
            correctIndex: 1,
            explanation: '过去时否定句用 did not (didn\'t) + 动词原形。',
            tip: '否定句公式：主语 + didn\'t + 动词原形'
        },
        {
            id: 'g1_07', topicId: 'past-tense', type: 'choose',
            question: '___ you visit your grandparents last weekend?',
            questionCn: '你上周末___你的祖父母了吗？',
            options: ['Do', 'Did', 'Does', 'Are'],
            correctIndex: 1,
            explanation: '过去时疑问句用 Did + 主语 + 动词原形。',
            tip: '疑问句公式：Did + 主语 + 动词原形？'
        },
        {
            id: 'g1_08', topicId: 'past-tense', type: 'fill-blank',
            question: 'My mother ___ (make) a cake for my birthday.',
            questionCn: '我妈妈为我的生日___了一个蛋糕。',
            options: ['make', 'makes', 'made', 'making'],
            correctIndex: 2,
            explanation: 'make的过去式是made。',
            tip: '不规则动词需要记忆：make → made'
        },
        {
            id: 'g1_09', topicId: 'past-tense', type: 'fill-blank',
            question: 'The students ___ (study) very hard last term.',
            questionCn: '学生们上学期学习___努力。',
            options: ['study', 'studied', 'studies', 'studying'],
            correctIndex: 1,
            explanation: '以辅音字母+y结尾的动词，变y为i再加-ed。',
            tip: '规则：辅音+y → 变y为i加-ed (study → studied)'
        },
        {
            id: 'g1_10', topicId: 'past-tense', type: 'fill-blank',
            question: 'She ___ (write) a letter to her friend two days ago.',
            questionCn: '她两天前给她朋友___了一封信。',
            options: ['write', 'wrote', 'writes', 'written'],
            correctIndex: 1,
            explanation: 'write的过去式是wrote。',
            tip: '时间标志词：two days ago（两天前）→ 用过去时'
        },
        {
            id: 'g1_11', topicId: 'past-tense', type: 'choose',
            question: 'He didn\'t ___ his homework last night.',
            questionCn: '他昨晚没有___作业。',
            options: ['did', 'does', 'do', 'doing'],
            correctIndex: 2,
            explanation: 'didn\'t后面用动词原形。',
            tip: 'didn\'t + 动词原形（不是过去式！）'
        },
        {
            id: 'g1_12', topicId: 'past-tense', type: 'fill-blank',
            question: 'I ___ (have) a great time at the party.',
            questionCn: '我在派对上玩得很___。',
            options: ['have', 'has', 'had', 'having'],
            correctIndex: 2,
            explanation: 'have的过去式是had。',
            tip: '不规则动词：have → had'
        },
        {
            id: 'g1_13', topicId: 'past-tense', type: 'fill-blank',
            question: 'The train ___ (arrive) at 9:00 this morning.',
            questionCn: '火车今天早上9点___了。',
            options: ['arrive', 'arrives', 'arrived', 'arriving'],
            correctIndex: 2,
            explanation: '以e结尾的动词，直接加-d。arrive → arrived。',
            tip: '规则：以e结尾 → 直接加-d'
        },
        {
            id: 'g1_14', topicId: 'past-tense', type: 'fill-blank',
            question: 'We ___ (swim) in the river last summer.',
            questionCn: '我们去年夏天在河里___。',
            options: ['swim', 'swam', 'swims', 'swimming'],
            correctIndex: 1,
            explanation: 'swim的过去式是swam。',
            tip: '不规则动词：swim → swam → swum'
        },
        {
            id: 'g1_15', topicId: 'past-tense', type: 'choose',
            question: 'What ___ you do last Sunday?',
            questionCn: '你上周日___了什么？',
            options: ['do', 'did', 'does', 'are'],
            correctIndex: 1,
            explanation: '过去时特殊疑问句：疑问词 + did + 主语 + 动词原形？',
            tip: '公式：What/Where/When + did + 主语 + 动词原形？'
        }
    ],

    'adverbs-frequency': [
        {
            id: 'g2_01', topicId: 'adverbs-frequency', type: 'choose',
            question: 'I ___ go to school by bus. I take the bus every day.',
            questionCn: '我___坐公交车上学。我每天都坐公交。',
            options: ['never', 'sometimes', 'always', 'hardly ever'],
            correctIndex: 2,
            explanation: 'every day（每天）= 100%频率 = always（总是）。',
            tip: '频率排序：always(100%) > usually > often > sometimes > hardly ever > never(0%)'
        },
        {
            id: 'g2_02', topicId: 'adverbs-frequency', type: 'choose',
            question: 'She ___ eats junk food. She thinks it\'s unhealthy.',
            questionCn: '她___吃垃圾食品。她觉得不健康。',
            options: ['always', 'usually', 'never', 'often'],
            correctIndex: 2,
            explanation: '她认为不健康 → 从不吃 → never。',
            tip: 'never = 0%，表示从来不做某事'
        },
        {
            id: 'g2_03', topicId: 'adverbs-frequency', type: 'choose',
            question: 'He is ___ late for school. He is late about once a month.',
            questionCn: '他___上学迟到。大约一个月迟到一次。',
            options: ['always', 'usually', 'hardly ever', 'often'],
            correctIndex: 2,
            explanation: '一个月一次 → 频率很低 → hardly ever（几乎不）。',
            tip: 'hardly ever ≈ 5-10%，几乎从不'
        },
        {
            id: 'g2_04', topicId: 'adverbs-frequency', type: 'choose',
            question: 'Where should the adverb go? "She (always) is happy."',
            questionCn: '频率副词应该放在哪里？',
            options: ['She always is happy.', 'She is always happy.', 'Always she is happy.', 'She is happy always.'],
            correctIndex: 1,
            explanation: '频率副词放在be动词后面。',
            tip: '位置规则：be动词后、实义动词前'
        },
        {
            id: 'g2_05', topicId: 'adverbs-frequency', type: 'choose',
            question: 'Tom ___ plays computer games. He plays about three times a week.',
            questionCn: 'Tom___玩电脑游戏。他大约一周玩三次。',
            options: ['never', 'hardly ever', 'often', 'always'],
            correctIndex: 2,
            explanation: '一周三次 → 频率较高 → often（经常）。',
            tip: 'often ≈ 60-70%，经常做'
        },
        {
            id: 'g2_06', topicId: 'adverbs-frequency', type: 'choose',
            question: 'I ___ drink milk for breakfast. I drink it about 5 days a week.',
            questionCn: '我早餐___喝牛奶。一周大约喝5天。',
            options: ['never', 'sometimes', 'usually', 'hardly ever'],
            correctIndex: 2,
            explanation: '一周5天 → 大多数时候 → usually（通常）。',
            tip: 'usually ≈ 80-90%，通常'
        },
        {
            id: 'g2_07', topicId: 'adverbs-frequency', type: 'choose',
            question: 'She ___ watches TV on weekdays. Only on weekends.',
            questionCn: '她工作日___看电视。只在周末看。',
            options: ['always', 'never', 'usually', 'often'],
            correctIndex: 1,
            explanation: '只在周末看 → 工作日从不看 → never。',
            tip: 'never用于否定，表示"从不"'
        },
        {
            id: 'g2_08', topicId: 'adverbs-frequency', type: 'choose',
            question: 'Where should the adverb go? "I (usually) get up at 6:00."',
            questionCn: '频率副词应该放在哪里？',
            options: ['I get usually up at 6:00.', 'Usually I get up at 6:00.', 'I usually get up at 6:00.', 'I get up usually at 6:00.'],
            correctIndex: 2,
            explanation: '频率副词放在实义动词前面。',
            tip: '位置规则：放在实义动词（get, go, eat等）前面'
        },
        {
            id: 'g2_09', topicId: 'adverbs-frequency', type: 'choose',
            question: 'We ___ go swimming in winter. It\'s too cold!',
            questionCn: '我们冬天___去游泳。太冷了！',
            options: ['always', 'often', 'usually', 'hardly ever'],
            correctIndex: 3,
            explanation: '冬天太冷了 → 几乎不去 → hardly ever。',
            tip: 'hardly ever表示因为某种原因几乎不做'
        },
        {
            id: 'g2_10', topicId: 'adverbs-frequency', type: 'choose',
            question: 'How often does she exercise? She ___ exercises. She does it every day.',
            questionCn: '她多久锻炼一次？她___锻炼。她每天都做。',
            options: ['sometimes', 'never', 'hardly ever', 'always'],
            correctIndex: 3,
            explanation: '每天都做 → 100% → always。',
            tip: 'How often提问频率，用频率副词或次数来回答'
        }
    ],

    'comparative': [
        {
            id: 'g3_01', topicId: 'comparative', type: 'fill-blank',
            question: 'Tom is ___ (tall) than Jerry.',
            questionCn: 'Tom比Jerry___。',
            options: ['tall', 'taller', 'tallest', 'more tall'],
            correctIndex: 1,
            explanation: '单音节形容词比较级加-er。tall → taller。',
            tip: '规则1：单音节（一个元音发音）→ 加-er'
        },
        {
            id: 'g3_02', topicId: 'comparative', type: 'fill-blank',
            question: 'English is ___ (important) than math for me.',
            questionCn: '英语对我来说比数学___。',
            options: ['important', 'importanter', 'more important', 'most important'],
            correctIndex: 2,
            explanation: '多音节形容词比较级用more + 形容词。',
            tip: '规则2：多音节（三个以上）→ more + adj'
        },
        {
            id: 'g3_03', topicId: 'comparative', type: 'fill-blank',
            question: 'This book is ___ (good) than that one.',
            questionCn: '这本书比那本___。',
            options: ['good', 'gooder', 'better', 'best'],
            correctIndex: 2,
            explanation: 'good的比较级是better（不规则变化）。',
            tip: '不规则：good → better, bad → worse'
        },
        {
            id: 'g3_04', topicId: 'comparative', type: 'fill-blank',
            question: 'My bag is ___ (heavy) than yours.',
            questionCn: '我的书包比你的___。',
            options: ['heavy', 'heavier', 'heavyer', 'more heavy'],
            correctIndex: 1,
            explanation: '以辅音字母+y结尾，变y为i加-er。heavy → heavier。',
            tip: '规则：辅音+y结尾 → 变y为i加-er'
        },
        {
            id: 'g3_05', topicId: 'comparative', type: 'fill-blank',
            question: 'Summer is ___ (hot) than spring.',
            questionCn: '夏天比春天___。',
            options: ['hot', 'hoter', 'hotter', 'more hot'],
            correctIndex: 2,
            explanation: '重读闭音节（辅+元+辅）双写末尾辅音字母加-er。',
            tip: '规则：hot/big/thin → 双写+er (hotter/bigger/thinner)'
        },
        {
            id: 'g3_06', topicId: 'comparative', type: 'choose',
            question: 'Li Ming is as ___ as Wang Fang.',
            questionCn: '李明和王芳一样___。',
            options: ['taller', 'tall', 'tallest', 'more tall'],
            correctIndex: 1,
            explanation: 'as...as中间用形容词原级。',
            tip: 'as + 形容词原级 + as = 和...一样...'
        },
        {
            id: 'g3_07', topicId: 'comparative', type: 'fill-blank',
            question: 'The movie is ___ (interesting) than the book.',
            questionCn: '这部电影比那本书___。',
            options: ['interesting', 'interestinger', 'more interesting', 'most interesting'],
            correctIndex: 2,
            explanation: 'interesting是多音节词，用more + interesting。',
            tip: '双音节以上的形容词用 more + 形容词'
        },
        {
            id: 'g3_08', topicId: 'comparative', type: 'fill-blank',
            question: 'The weather today is ___ (bad) than yesterday.',
            questionCn: '今天的天气比昨天___。',
            options: ['bad', 'bader', 'worse', 'worst'],
            correctIndex: 2,
            explanation: 'bad的比较级是worse（不规则变化）。',
            tip: '不规则：bad → worse → worst'
        },
        {
            id: 'g3_09', topicId: 'comparative', type: 'choose',
            question: 'She is two years ___ than me.',
            questionCn: '她比我大两岁。',
            options: ['old', 'older', 'oldest', 'more old'],
            correctIndex: 1,
            explanation: 'than前用比较级。old → older。',
            tip: '看到than → 前面一定用比较级'
        },
        {
            id: 'g3_10', topicId: 'comparative', type: 'fill-blank',
            question: 'This dress is ___ (expensive) than that one.',
            questionCn: '这条裙子比那条___。',
            options: ['expensive', 'expensiver', 'more expensive', 'most expensive'],
            correctIndex: 2,
            explanation: 'expensive是多音节词，比较级用more expensive。',
            tip: '三个音节以上 → more + adj'
        },
        {
            id: 'g3_11', topicId: 'comparative', type: 'choose',
            question: 'My sister is not as ___ as me.',
            questionCn: '我妹妹不如我___。',
            options: ['taller', 'tallest', 'tall', 'more tall'],
            correctIndex: 2,
            explanation: 'not as...as中间也用原级。',
            tip: 'not as + 原级 + as = 不如...那么...'
        },
        {
            id: 'g3_12', topicId: 'comparative', type: 'fill-blank',
            question: 'A car is ___ (fast) than a bicycle.',
            questionCn: '汽车比自行车___。',
            options: ['fast', 'faster', 'fastest', 'more fast'],
            correctIndex: 1,
            explanation: 'fast是单音节词，比较级加-er。',
            tip: '单音节直接加-er'
        },
        {
            id: 'g3_13', topicId: 'comparative', type: 'fill-blank',
            question: 'Her hair is ___ (long) than mine.',
            questionCn: '她的头发比我的___。',
            options: ['long', 'longer', 'longest', 'more long'],
            correctIndex: 1,
            explanation: 'long → longer，单音节加-er。',
            tip: '单音节形容词：直接加-er'
        },
        {
            id: 'g3_14', topicId: 'comparative', type: 'fill-blank',
            question: 'He works ___ (hard) than before.',
            questionCn: '他比以前学习更___了。',
            options: ['hard', 'harder', 'hardest', 'more hard'],
            correctIndex: 1,
            explanation: 'hard也可以用作副词，比较级加-er。',
            tip: 'hard既是形容词也是副词，比较级都是harder'
        },
        {
            id: 'g3_15', topicId: 'comparative', type: 'choose',
            question: 'Which is ___, Chinese or English?',
            questionCn: '哪个更难，语文还是英语？',
            options: ['difficult', 'difficulter', 'more difficult', 'most difficult'],
            correctIndex: 2,
            explanation: '两者比较用比较级。difficult是多音节词。',
            tip: '两者比较 → 比较级；三者以上 → 最高级'
        }
    ],

    'superlative': [
        {
            id: 'g4_01', topicId: 'superlative', type: 'fill-blank',
            question: 'He is ___ (tall) student in our class.',
            questionCn: '他是我们班___的学生。',
            options: ['tall', 'taller', 'the tallest', 'tallest'],
            correctIndex: 2,
            explanation: '最高级前要加the。tall → the tallest。',
            tip: '最高级公式：the + 最高级 + in/of'
        },
        {
            id: 'g4_02', topicId: 'superlative', type: 'fill-blank',
            question: 'This is ___ (interesting) book I have ever read.',
            questionCn: '这是我读过的___的书。',
            options: ['interesting', 'more interesting', 'most interesting', 'the most interesting'],
            correctIndex: 3,
            explanation: '多音节词最高级用the most + 形容词。',
            tip: '多音节：the most + adj'
        },
        {
            id: 'g4_03', topicId: 'superlative', type: 'fill-blank',
            question: 'Winter is ___ (cold) season of the year.',
            questionCn: '冬天是一年中___的季节。',
            options: ['cold', 'colder', 'coldest', 'the coldest'],
            correctIndex: 3,
            explanation: '在所有季节中最冷 → 最高级 the coldest。',
            tip: 'of the year = 在一年中 → 用最高级'
        },
        {
            id: 'g4_04', topicId: 'superlative', type: 'fill-blank',
            question: 'She is ___ (good) student in our school.',
            questionCn: '她是我们学校___的学生。',
            options: ['good', 'better', 'best', 'the best'],
            correctIndex: 3,
            explanation: 'good的最高级是the best（不规则）。',
            tip: '不规则：good → better → the best'
        },
        {
            id: 'g4_05', topicId: 'superlative', type: 'choose',
            question: 'The Yangtze River is ___ river in China.',
            questionCn: '长江是中国___的河流。',
            options: ['long', 'longer', 'longest', 'the longest'],
            correctIndex: 3,
            explanation: '在中国所有河流中最长 → the longest。',
            tip: 'in China限定范围 → 用最高级'
        },
        {
            id: 'g4_06', topicId: 'superlative', type: 'fill-blank',
            question: 'Math is ___ (difficult) subject of all for me.',
            questionCn: '数学是所有科目中对我来说___的。',
            options: ['difficult', 'more difficult', 'most difficult', 'the most difficult'],
            correctIndex: 3,
            explanation: 'of all = 在所有...中 → 用最高级。',
            tip: 'of all = 在所有中 → the most + adj'
        },
        {
            id: 'g4_07', topicId: 'superlative', type: 'fill-blank',
            question: 'He is ___ (busy) person in the office.',
            questionCn: '他是办公室里___的人。',
            options: ['busy', 'busier', 'busiest', 'the busiest'],
            correctIndex: 3,
            explanation: '辅音+y结尾，变y为i加-est。busy → busiest。',
            tip: '规则：辅音+y → 变y为i加-est'
        },
        {
            id: 'g4_08', topicId: 'superlative', type: 'fill-blank',
            question: 'It was ___ (bad) day of my life.',
            questionCn: '那是我人生中___的一天。',
            options: ['bad', 'worse', 'worst', 'the worst'],
            correctIndex: 3,
            explanation: 'bad的最高级是the worst（不规则）。',
            tip: '不规则：bad → worse → the worst'
        },
        {
            id: 'g4_09', topicId: 'superlative', type: 'choose',
            question: 'Who is ___ of the three?',
            questionCn: '三个人中谁___？',
            options: ['young', 'younger', 'youngest', 'the youngest'],
            correctIndex: 3,
            explanation: '三者比较用最高级。',
            tip: 'of the three = 三者中 → 最高级'
        },
        {
            id: 'g4_10', topicId: 'superlative', type: 'fill-blank',
            question: 'This is ___ (big) park in our city.',
            questionCn: '这是我们城市___的公园。',
            options: ['big', 'bigger', 'biggest', 'the biggest'],
            correctIndex: 3,
            explanation: '重读闭音节双写末尾辅音+est。big → biggest。',
            tip: '规则：big/hot/thin → 双写+est'
        }
    ],

    'infinitive': [
        {
            id: 'g5_01', topicId: 'infinitive', type: 'fill-blank',
            question: 'I want ___ (learn) English well.',
            questionCn: '我想___好英语。',
            options: ['learn', 'to learn', 'learning', 'learned'],
            correctIndex: 1,
            explanation: 'want后面跟to do（不定式）。',
            tip: 'want + to do = 想要做某事'
        },
        {
            id: 'g5_02', topicId: 'infinitive', type: 'fill-blank',
            question: 'She decided ___ (study) abroad next year.',
            questionCn: '她决定明年___国外。',
            options: ['study', 'to study', 'studying', 'studied'],
            correctIndex: 1,
            explanation: 'decide后面跟to do。',
            tip: 'decide + to do = 决定做某事'
        },
        {
            id: 'g5_03', topicId: 'infinitive', type: 'fill-blank',
            question: 'It\'s important ___ (exercise) every day.',
            questionCn: '每天___很重要。',
            options: ['exercise', 'to exercise', 'exercising', 'exercised'],
            correctIndex: 1,
            explanation: 'It\'s + adj + to do 是固定句型。',
            tip: '句型：It\'s + 形容词 + to do = 做某事是...的'
        },
        {
            id: 'g5_04', topicId: 'infinitive', type: 'fill-blank',
            question: 'He plans ___ (visit) his uncle next week.',
            questionCn: '他计划下周___他叔叔。',
            options: ['visit', 'to visit', 'visiting', 'visited'],
            correctIndex: 1,
            explanation: 'plan后面跟to do。',
            tip: 'plan + to do = 计划做某事'
        },
        {
            id: 'g5_05', topicId: 'infinitive', type: 'choose',
            question: 'My mother told me ___ hard.',
            questionCn: '我妈妈叫我努力___。',
            options: ['study', 'to study', 'studying', 'studied'],
            correctIndex: 1,
            explanation: 'tell sb. to do sth. = 告诉某人做某事。',
            tip: 'tell/ask/want + sb. + to do'
        },
        {
            id: 'g5_06', topicId: 'infinitive', type: 'choose',
            question: 'It\'s easy ___ this question.',
            questionCn: '___这个问题很容易。',
            options: ['answer', 'to answer', 'answering', 'answered'],
            correctIndex: 1,
            explanation: 'It\'s + easy + to do 固定句型。',
            tip: 'It\'s easy/hard/difficult/important + to do'
        },
        {
            id: 'g5_07', topicId: 'infinitive', type: 'fill-blank',
            question: 'I hope ___ (see) you again soon.',
            questionCn: '我希望很快再___你。',
            options: ['see', 'to see', 'seeing', 'saw'],
            correctIndex: 1,
            explanation: 'hope后面跟to do。',
            tip: 'hope + to do = 希望做某事'
        },
        {
            id: 'g5_08', topicId: 'infinitive', type: 'choose',
            question: 'She needs ___ more vegetables.',
            questionCn: '她需要___更多蔬菜。',
            options: ['eat', 'to eat', 'eating', 'ate'],
            correctIndex: 1,
            explanation: 'need后面跟to do。',
            tip: 'need + to do = 需要做某事'
        },
        {
            id: 'g5_09', topicId: 'infinitive', type: 'fill-blank',
            question: 'He promised ___ (help) me with my homework.',
            questionCn: '他承诺___我做作业。',
            options: ['help', 'to help', 'helping', 'helped'],
            correctIndex: 1,
            explanation: 'promise后面跟to do。',
            tip: 'promise + to do = 承诺做某事'
        },
        {
            id: 'g5_10', topicId: 'infinitive', type: 'choose',
            question: 'It\'s necessary for us ___ English every day.',
            questionCn: '对我们来说每天___英语是必要的。',
            options: ['practice', 'to practice', 'practicing', 'practiced'],
            correctIndex: 1,
            explanation: 'It\'s + adj + for sb. + to do sth.',
            tip: '句型：It\'s + adj + for sb. + to do'
        }
    ],

    'be-going-to': [
        {
            id: 'g6_01', topicId: 'be-going-to', type: 'fill-blank',
            question: 'I ___ going to study computer science.',
            questionCn: '我___学计算机科学。',
            options: ['is', 'am', 'are', 'be'],
            correctIndex: 1,
            explanation: 'I后面用am。be going to中的be随主语变化。',
            tip: 'I → am, he/she/it → is, we/you/they → are'
        },
        {
            id: 'g6_02', topicId: 'be-going-to', type: 'fill-blank',
            question: 'She ___ going to be a doctor when she grows up.',
            questionCn: '她长大后___当医生。',
            options: ['am', 'is', 'are', 'be'],
            correctIndex: 1,
            explanation: 'She后面用is。',
            tip: '第三人称单数 → is going to'
        },
        {
            id: 'g6_03', topicId: 'be-going-to', type: 'choose',
            question: 'They are going to ___ a party tomorrow.',
            questionCn: '他们明天___开一个派对。',
            options: ['have', 'has', 'had', 'having'],
            correctIndex: 0,
            explanation: 'be going to后面用动词原形。',
            tip: 'be going to + 动词原形（不变！）'
        },
        {
            id: 'g6_04', topicId: 'be-going-to', type: 'fill-blank',
            question: 'We ___ not going to play football today.',
            questionCn: '我们今天___踢足球了。',
            options: ['is', 'am', 'are', 'be'],
            correctIndex: 2,
            explanation: 'We后面用are。否定：be + not + going to。',
            tip: '否定句：主语 + be + not + going to + 动词原形'
        },
        {
            id: 'g6_05', topicId: 'be-going-to', type: 'choose',
            question: '___ you going to visit the museum this weekend?',
            questionCn: '你这周末___参观博物馆吗？',
            options: ['Is', 'Am', 'Are', 'Do'],
            correctIndex: 2,
            explanation: '疑问句把be提到主语前面。you → Are。',
            tip: '疑问句：Be + 主语 + going to + 动词原形？'
        },
        {
            id: 'g6_06', topicId: 'be-going-to', type: 'choose',
            question: 'Look at the dark clouds! It ___ rain.',
            questionCn: '看那些乌云！___要下雨了。',
            options: ['is going to', 'will', 'is going', 'going to'],
            correctIndex: 0,
            explanation: '有迹象表明将要发生 → 用be going to。',
            tip: 'be going to用于有迹象/计划的将来事件'
        },
        {
            id: 'g6_07', topicId: 'be-going-to', type: 'fill-blank',
            question: 'He is going to ___ (write) an article about his school.',
            questionCn: '他___写一篇关于他学校的文章。',
            options: ['write', 'writes', 'wrote', 'writing'],
            correctIndex: 0,
            explanation: 'be going to后面跟动词原形。',
            tip: 'be going to + 动词原形'
        },
        {
            id: 'g6_08', topicId: 'be-going-to', type: 'choose',
            question: 'What ___ he going to do this summer?',
            questionCn: '他这个夏天___做什么？',
            options: ['am', 'is', 'are', 'does'],
            correctIndex: 1,
            explanation: 'he → is。特殊疑问句：疑问词 + is/am/are + 主语 + going to。',
            tip: '特殊疑问句：What + be + 主语 + going to do?'
        },
        {
            id: 'g6_09', topicId: 'be-going-to', type: 'choose',
            question: 'I\'m going to ___ a resolution this new year.',
            questionCn: '我___在新年制定一个决心。',
            options: ['make', 'makes', 'made', 'making'],
            correctIndex: 0,
            explanation: 'be going to + 动词原形。make a resolution = 下决心。',
            tip: 'make a resolution = 下决心/制定目标'
        },
        {
            id: 'g6_10', topicId: 'be-going-to', type: 'choose',
            question: 'My parents ___ going to take me to the zoo next Sunday.',
            questionCn: '我父母下周日___带我去动物园。',
            options: ['is', 'am', 'are', 'was'],
            correctIndex: 2,
            explanation: 'parents是复数 → are。',
            tip: '复数主语 → are going to'
        }
    ]
};
