import cron from "node-cron";
import chalk from "chalk"
import UserModel from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js";

export const startDeleteOldUsersCron = () => {
    cron.schedule("* * * * *", async () => {
        console.log(chalk.blue.bold("⏳ Cron Job Running..."));

        const days30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        await dbService.deleteMany({
            model: UserModel,
            filter: {
                isDeleted: true,
                deletedAt: { $lte: days30 }
            }
        });

        console.log(chalk.green.bold("✔ Hard delete done for expired soft-deleted accounts"));
    });
};
