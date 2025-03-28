const fs = require("fs-extra");
const { Command } = require("commander");
const chalk = require("chalk");
const moment = require("moment");

const program = new Command();
const TASKS_FILE = "tasks.json";
const PREF_FILE = "preferences.json";

const loadTasks = () => {
    try {
        return fs.readJsonSync(TASKS_FILE);
    } catch {
        return [];
    }
};

const saveTasks = (tasks) => {
    fs.writeJsonSync(TASKS_FILE, tasks, { spaces: 4 });
};

const validateTaskInput = (title, due_date) => {
    if (!title.trim()) {
        console.log(chalk.red("Task title cannot be empty."));
        process.exit(1);
    }
    if (!moment(due_date, "YYYY-MM-DD", true).isValid()) {
        console.log(chalk.red("Invalid due date format. Use YYYY-MM-DD."));
        process.exit(1);
    }
};

const listTasks = () => {
    const tasks = loadTasks();
    if (!tasks.length) {
        console.log(chalk.yellow("No tasks available."));
        return;
    }
    console.table(tasks);
};

const addTask = (title, due_date) => {
    validateTaskInput(title, due_date);
    const tasks = loadTasks();
    tasks.push({ id: tasks.length + 1, title, due_date, completed: false });
    saveTasks(tasks);
    console.log(chalk.green("Task added successfully."));
};

const updateTask = (id, new_title, new_due_date) => {
    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === parseInt(id));
    if (!task) {
        console.log(chalk.red("Task not found."));
        return;
    }
    if (new_title) task.title = new_title;
    if (new_due_date) {
        if (!moment(new_due_date, "YYYY-MM-DD", true).isValid()) {
            console.log(chalk.red("Invalid due date format. Use YYYY-MM-DD."));
            return;
        }
        task.due_date = new_due_date;
    }
    saveTasks(tasks);
    console.log(chalk.green("Task updated successfully."));
};

const deleteTask = (id) => {
    let tasks = loadTasks();
    tasks = tasks.filter((t) => t.id !== parseInt(id));
    saveTasks(tasks);
    console.log(chalk.red("Task deleted successfully."));
};

const searchTasks = (keyword) => {
    const tasks = loadTasks();
    const results = tasks.filter(
        (t) => t.title.includes(keyword) || t.due_date.includes(keyword)
    );
    if (!results.length) {
        console.log(chalk.yellow("No matching tasks found."));
    } else {
        console.table(results);
    }
};

const setPreference = (key, value) => {
    let preferences = {};
    try {
        preferences = fs.readJsonSync(PREF_FILE);
    } catch {}
    preferences[key] = value;
    fs.writeJsonSync(PREF_FILE, preferences, { spaces: 4 });
    console.log(chalk.green("Preferences updated successfully."));
};

program.command("list-tasks").description("List all tasks").action(listTasks);

program
    .command("add-task <title> <due_date>")
    .description("Add a new task")
    .action(addTask);

program
    .command("update-task <id> [new_title] [new_due_date]")
    .description("Update a task")
    .action(updateTask);

program.command("delete-task <id>").description("Delete a task").action(deleteTask);

program
    .command("search-tasks <keyword>")
    .description("Search tasks")
    .action(searchTasks);

program
    .command("set-preference <key> <value>")
    .description("Set user preferences")
    .action(setPreference);

program.command("help").description("List commands").action(() => program.help());

program.parse(process.argv);
