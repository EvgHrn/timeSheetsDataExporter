const processesList = [
    {
        id: 1,
        name: "Допечатная подготовка",
        departments: [ "Допечатная подготовка"  ],
        subproductsIds: [ 3 ]
    },
    {
        id: 2,
        name: "Включение, выключение, настройка техники",
        departments: [ "Участок печати" ],
        subproductsIds: []
    },
    {
        id: 3,
        name: "Усадка ткани",
        departments: [ "Участок печати" ],
        subproductsIds: [ 2 ]
    },
    {
        id: 4,
        name: "Печать на плоттере",
        departments: [ "Участок печати" ],
        subproductsIds: [ 1 ]
    },
    {
        id: 5,
        name: "Раскрой, сгибание бумаги",
        departments: [ "Участок печати" ],
        subproductsIds: [ 4 ]
    },
    {
        id: 6,
        name: "Получение на складе",
        departments: [ "Участок печати" ],
        subproductsIds: [ 5 ]
    },
    {
        id: 7,
        name: "Перенос на ткань",
        departments: [ "Участок печати" ],
        subproductsIds: [ 6 ]
    },
    {
        id: 8,
        name: "Изготовление основы",
        departments: [ "Участок печати" ],
        subproductsIds: [ 7 ]
    },
    {
        id: 9,
        name: "Перенос на основу",
        departments: [ "Участок печати" ],
        subproductsIds: [ 8 ]
    },
    {
        id: 10,
        name: "Нарезка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 9 ]
    },
    {
        id: 11,
        name: "Перенос на изделие",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 12,
        name: "Сборка герба",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 13,
        name: "Нарезка пластины",
        departments: [ "Участок печати" ],
        subproductsIds: [ 11 ]
    },
    {
        id: 14,
        name: "Приклеивание пластины к плакетке",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 15,
        name: "Сборка часов",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 16,
        name: "Сгибание пластины",
        departments: [ "Участок печати" ],
        subproductsIds: [ 12 ]
    },
    {
        id: 17,
        name: "Установка люверсов",
        departments: [ "Участок печати" , "Раскрой" ],
        subproductsIds: [ 13 ]
    },
    {
        id: 18,
        name: "Уборка, обслуживание",
        departments: [ "Участок печати" , "Раскрой" ],
        subproductsIds: []
    },
    {
        id: 19,
        name: "Прочее",
        departments: [
            "Участок печати" ,
            "Раскрой" ,
            "Допечатная подготовка"  ,
            "Упаковка"  ,
            "Швейный цех" ,
            "Склад"  ,
            "Вышивка"  
        ],
        subproductsIds: []
    },
    {
        id: 20,
        name: "Натяжка сетки на раму",
        departments: [ "Участок печати" ],
        subproductsIds: [ 14 ]
    },
    {
        id: 21,
        name: "Нанесение эмульсии",
        departments: [ "Участок печати" ],
        subproductsIds: [ 15 ]
    },
    {
        id: 22,
        name: "Экспонирование, проявка, сушка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 16 ]
    },
    {
        id: 23,
        name: "Регенерация, сушка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 14 ]
    },
    {
        id: 24,
        name: "Печать шелкография",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 25,
        name: "Подготовка/замес краски",
        departments: [ "Участок печати" ],
        subproductsIds: [ 18 ]
    },
    {
        id: 26,
        name: "Вырубка шевронов",
        departments: [ "Участок печати" ],
        subproductsIds: [ 19 ]
    },
    {
        id: 27,
        name: "Вальцовка значков",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 28,
        name: "Резка, нанесение пленки",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 29,
        name: "Сушка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 30,
        name: "Печать термотрансферная",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 31,
        name: "Печать прямая",
        departments: [ "Участок печати" ],
        subproductsIds: [ 10 ]
    },
    {
        id: 32,
        name: "Проверка",
        departments: [ "Участок печати" ],
        subproductsIds: []
    },
    {
        id: 33,
        name: "Удаление лишней плёнки",
        departments: [ "Участок печати" ],
        subproductsIds: [ 20 ]
    },
    {
        id: 34,
        name: "Надувание шаров",
        departments: [ "Участок печати" ],
        subproductsIds: [ 21 ]
    },
    {
        id: 35,
        name: "Сбор краски, замывка станка",
        departments: [ "Участок печати" ],
        subproductsIds: []
    },
    {
        id: 36,
        name: "Печать на тампостанке",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 37,
        name: "Подготовка клише",
        departments: [ "Участок печати" ],
        subproductsIds: [ 22 ]
    },
    {
        id: 38,
        name: "Печать фотовывода",
        departments: [ "Участок печати" ],
        subproductsIds: [ 23 ]
    },
    {
        id: 39,
        name: "Нарезка, нанесение, приклеивание пластины",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 40,
        name: "Нарезка, нанесение на пластину",
        departments: [ "Участок печати" ],
        subproductsIds: [ 24 ]
    },
    {
        id: 41,
        name: "Изг. основы, нанесение, нарезка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 25 ]
    },
    {
        id: 42,
        name: "Нанесение, нарезка",
        departments: [ "Участок печати" ],
        subproductsIds: [ 8 ]
    },
    {
        id: 43,
        name: "Раскрой ткани",
        departments: [ "Раскрой" ],
        subproductsIds: [ 26 ]
    },
    {
        id: 44,
        name: "Изготовление основы герба",
        departments: [ "Участок печати" ],
        subproductsIds: [ 27 ]
    },
    {
        id: 45,
        name: "Натяжка герба",
        departments: [ "Участок печати" ],
        subproductsIds: [ 28 ]
    },
    {
        id: 46,
        name: "Изготовление значка",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    },
    {
        id: 47,
        name: "Печать на принтере",
        departments: [ "Допечатная подготовка" ],
        subproductsIds: [ 29 ]
    },
    {
        id: 48,
        name: "Упаковка",
        departments: [ "Упаковка" ],
        subproductsIds: []
    },
    {
        id: 49,
        name: "Фото на согласование",
        departments: [ "Упаковка" ],
        subproductsIds: [ 30 ]
    },
    {
        id: 50,
        name: "Комплектация",
        departments: [ "Раскрой" ],
        subproductsIds: [ 31 ]
    },
    {
        id: 51,
        name: "Раскрой ткани + комплектация",
        departments: [ "Раскрой" ],
        subproductsIds: [ 31 ]
    },
    {
        id: 52,
        name: "Раскрой бумаги + перенос на ткань",
        departments: [ "Участок печати" ],
        subproductsIds: [ 6 ]
    },
    {
        id: 53,
        name: "Простой",
        departments: [ "Допечатная подготовка" ],
        subproductsIds: []
    },
    {
        id: 54,
        name: "Подготовка/Настройка станка/принтера",
        departments: ["Участок печати" ],
        subproductsIds: []
    },
    {
        id: 55,
        name: "Нарезка, нанесение на шильд",
        departments: [ "Участок печати" ],
        subproductsIds: [],
        isFinish: true
    }
];

module.exports = processesList;