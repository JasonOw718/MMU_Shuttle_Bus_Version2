import axios from "axios";
import { DEFAULT_ERROR_MESSAGE, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "../shared/constants";

export async function submitFeedback(description: string, file?: File | null): Promise<void> {
    try {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            throw new Error(DEFAULT_ERROR_MESSAGE);
        }

        if (file) {
            const formData = new FormData();
            formData.append("chat_id", TELEGRAM_CHAT_ID);
            formData.append("caption", `🚌 New Shuttle Feedback:\n\n${description}`);
            formData.append("document", file);

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData);
            return;
        }

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: `🚌 New Shuttle Feedback:\n\n${description}`,
            
        });
    } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
            throw new Error(e.response?.data?.description ?? DEFAULT_ERROR_MESSAGE);
        }
        throw new Error(DEFAULT_ERROR_MESSAGE);
    }
}
