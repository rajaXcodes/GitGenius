
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useProject from "@/hooks/use-projects"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./action";
import { readStreamableValue } from "@ai-sdk/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
const AskQuestion = () => {
    const { project } = useProject();
    const [question, setQuestion] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [filesReference, setFilesReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
    const [answer, setAnswer] = React.useState('');
    const savenAnswer = api.project.saveAnswer.useMutation();
    const refetch = useRefetch();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!project?.id) return;
        setAnswer('');
        setFilesReferences([]);
        e.preventDefault();
        setOpen(true);
        setLoading(true);
        setOpen(true)

        const res = await askQuestion(question, project.id);
        if (!res) throw new Error('Could not answer now!!');
        const { output, fileRefernces } = res;
        setFilesReferences(fileRefernces);

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta);
            }
        }
        setLoading(false);
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">


                            <DialogTitle>
                                <Image src='/logo.png' alt="logo" width={60} height={60} />
                            </DialogTitle>
                            <Button disabled={savenAnswer.isPending} variant={'outline'} onClick={() => savenAnswer.mutate({ projectId: project!.id, question, answer, fileReferences: filesReference }, {
                                onSuccess: () => {
                                    toast.success('Answer saved!')
                                    refetch();
                                },
                                onError: () => {
                                    toast.error('Failed to save answer!')
                                }
                            })}>Save Answer</Button>
                        </div>
                    </DialogHeader>
                    <MDEditor.Markdown source={answer} className="max-w-[70vw] h-full max-h-[40vh] overflow-scroll" />
                    <div className="h-4"></div>
                    <CodeReferences fileReferences={filesReference} />
                    <Button type='button' onClick={() => { setOpen(false) }}>Close</Button>
                </DialogContent>
            </Dialog>

            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder="Which file should I edit to change the homw page?" value={question} onChange={e => setQuestion(e.target.value)} />
                        <div className="h-4"></div>
                        <Button type='submit' disabled={loading}>Ask GitGenius</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}



export default AskQuestion


