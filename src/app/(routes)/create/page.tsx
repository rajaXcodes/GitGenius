'use client'
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { projectRouter } from "@/server/api/routers/project";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
type FormInput = {
    repoUrl: string,
    projectName: string,
    githubtoken?: string
}
const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation();
    const refetch = useRefetch();
    function onSubmit(data: FormInput) {
        createProject.mutate({
            name: data.projectName,
            githubUrl: data.repoUrl,
        }, {
            onSuccess: () => {
                toast.success('Project created succussfully!');
                refetch();
            },
            onError: (err) => {
                toast.error(`Error creating project: ${err.message}`);
            }
        });
        reset();
        return true;
    }
    return (
        <div className="flex items-center gap-12 h-full justify-center">
            <img src='/create.svg' alt="program" className="h-56 w-auto" />
            <div>
                <div>
                    <h1 className="font-semibold text-2xl">
                        Link your GitHub Repositery
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the URL of your repositery to link it to GitGenius
                    </p>
                </div>
                <div className="h-4"></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input required
                            {...register("projectName")}
                            placeholder="Project Name"
                        />
                        <div className="h-2"></div>
                        <Input required
                            {...register("repoUrl")}
                            placeholder="GitHub Repository URL"
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register("githubtoken")}
                            placeholder="GitHub Token (Optional, for private repos)"
                        />
                        <div className="h-4"></div>
                        <Button type="submit" disabled={createProject.isPending}> Create Project</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage;