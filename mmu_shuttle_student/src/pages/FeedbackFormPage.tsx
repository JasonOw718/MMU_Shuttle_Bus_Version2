import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CloudUpload, X } from "lucide-react";
import Header from "../components/Header";
import { submitFeedback } from "../services/feedbackService";
import type { Feedback } from "../interfaces/models/Feedback";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 1000;

const FeedbackFormPage = () => {
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [fileError, setFileError] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: async (feedback: Feedback) => {
            return await submitFeedback(feedback.description, feedback.file);
        },
        onSuccess: () => {
            setDescription("");
            setFile(null);
            setFileInputKey((currentKey) => currentKey + 1);
            toast.success("Feedback submitted successfully.");
        },
        onError: (e) => {
            toast.error(e instanceof Error ? e.message : "Failed to submit feedback.");
        },
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutate({ description: description.trim(), file });
    };

    const clearFile = () => {
        setFile(null);
        setFileError("");
        setFileInputKey((currentKey) => currentKey + 1);
    };

    const handleFileChange = (selectedFile?: File) => {
        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setFileError("Only image files are allowed.");
            setFile(null);
            setFileInputKey((currentKey) => currentKey + 1);
            return;
        }

        if (selectedFile.size > MAX_IMAGE_SIZE) {
            setFileError("Image file must not exceed 10MB.");
            setFile(null);
            setFileInputKey((currentKey) => currentKey + 1);
            return;
        }

        setFileError("");
        setFile(selectedFile);
    };

    return (
        <div className="w-full">
            <div className="px-6 md:px-12 lg:px-20">
                <Header title="Feedback Form" description="Share your feedback about the shuttle bus service" />
            </div>

            <main className="w-full px-6 md:px-12 lg:px-20 pb-8 md:pb-10">
                <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={6}
                            maxLength={MAX_DESCRIPTION_LENGTH}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#113a9f] focus:ring-2 focus:ring-[#113a9f]/10 resize-none"
                            placeholder="Enter your feedback"
                            required
                        />
                        <p className="text-xs text-slate-500 text-right">
                            {description.length}/{MAX_DESCRIPTION_LENGTH}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="feedback-file" className="text-sm font-semibold text-slate-700">
                            Upload File (Optional)
                        </label>
                        <input
                            key={fileInputKey}
                            id="feedback-file"
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleFileChange(event.target.files?.[0])}
                            className="hidden"
                        />
                        <label
                            htmlFor="feedback-file"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <CloudUpload className="w-5 h-5 text-slate-500 shrink-0" />
                            <span className="flex-1 text-sm text-slate-600 truncate">
                                {file ? file.name : "Add Attachment"}
                            </span>
                            {file && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        clearFile();
                                    }}
                                    className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                                    aria-label="clear file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </label>
                        {fileError && (
                            <p className="text-sm text-red-600">
                                {fileError}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || description.trim().length === 0 || description.length > MAX_DESCRIPTION_LENGTH}
                        className="w-full md:w-fit bg-[#113a9f] text-white font-semibold px-6 py-3 rounded-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#0d2f82] transition-colors"
                    >
                        {isPending ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default FeedbackFormPage;
