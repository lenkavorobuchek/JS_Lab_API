const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let expenses = [];
// лимит потраченных денег на день
let dayLimit = {};


//проверка валидности даты

function ValidDate(dateCheck) {
    var helpDate = new Date(dateCheck);
    return helpDate instanceof Date && !isNaN(helpDate);
}

// расходы
app.post('/expenses', (req, res) => {
    
    const { name, amount, date } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Не заполнено поле наименования расходов" });
    }
    if (!amount) {
        return res.status(400).json({ error: "Не заполнено колличество потраченых денежных средств" });
    }
    if (!date) {
        return res.status(400).json({ error: "Не указана дата" });
    }
    if (!ValidDate(date)) {
        return res.status(400).json({ error: "Некорректно указана дата" }); 
    }
    if (dayLimit[date]) {
        const expensesOfDay = expenses.map(expense => expense.date === date ? Number(expense.amount) : 0);
        
        let sumExpensesOfDay = expensesOfDay.reduce(function (x, y) {
            return x + y;
        }, 0);
        // console.log(sumExpensesOfDay);
        // console.log(dayLimit[date]);
        if (dayLimit[date] < (Number(sumExpensesOfDay) + Number(amount))) {
            return res.status(200).json({message: `Ваши расходы за день уже составляют: ${sumExpensesOfDay} вы не можете потратить больше чем лимит: ${dayLimit[date]}`});
        }

    }
    const currentExpense = { name, amount, date };
    expenses.push(currentExpense);
    return res.status(201).send('Расход успешно добавлен');
});


// Установка лимита на день
app.post('/expenses/limit', (req, res) => {
    
    const { date, limit } = req.body;
    if (!date || !limit) {
        return res.status(400).json({ error: "Не указаны все обязательные поля"});
    }

    if (!ValidDate(date)) {
        return res.status(400).json({ error: "Некорректно указана дата" }); 
    }


    dayLimit[date] = limit;
    return res.status(201).json({message: `Лимит в размере ${limit} установлен на дату ${date}`});
});



// получение всех трат
app.get('/expenses', (req, res) => {
   
    return res.status(200).json(expenses);
});


// траты за день
app.post('/expenses/day', (req, res) => {
    
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ error: "Не указана дата"});
    }
    if (!ValidDate(date)) {
        return res.status(400).json({ error: "Некорректно указана дата" }); 
    }


    const expensesOfDay = expenses.filter(expense => expense.date === date);
    return res.status(200).json(expensesOfDay);

});

// получение лимита
app.get('/expenses/limit/:date', (req, res) => {
    
    const date = req.params.date;
    const limit = dayLimit[date];

    if (!ValidDate(date)) {
        return res.status(400).json({ error: "Некорректно указана дата" }); 
    }
    if (!limit) {
        return res.status(404).json({message: `Для дня ${date} не установлен лимит`});
    }
    return res.status(200).json({ limit });
});

app.use((req, res, next) => {
    console.log(`Запрос ${req.method} ${req.path}`);
    next();
})

app.listen(3000, () => {
    console.log("Сервер запущен на порте 3000");
})