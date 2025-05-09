import schedule from "node-schedule";
import Captcha from "@/models/captcha";

// 每天凌晨 2 点执行清理任务
const job = schedule.scheduleJob("0 2 * * *", async () => {
  try {
    await Captcha.deleteMany({
      expireAt: { $lt: new Date() },
    });
    console.log("过期验证码清理完成");
  } catch (error) {
    console.error("清理过期验证码时出错:", error);
  }
});

export default job;
