'use client'
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { Info } from "lucide-react";

type FormInput = {
    repoUrl: string,
    projectName: string,
    githubtoken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation();
    const refetch = useRefetch();
    const checkCredits = api.project.checkCredits.useMutation();

    function onSubmit(data: FormInput) {
        // If credits already checked, create the project
        if (!!checkCredits.data) {
            createProject.mutate({
                name: data.projectName,
                githubUrl: data.repoUrl,
                githubToken: data.githubtoken
            }, {
                onSuccess: () => {
                    toast.success('Project created successfully!');
                    refetch();
                    reset(); // Only reset after successful project creation
                    checkCredits.reset(); // Reset credits check state
                },
                onError: (err) => {
                    toast.error(`Error creating project: ${err.message}`);
                }
            });
        } else {
            // First step: check credits
            checkCredits.mutate({
                githubUrl: data.repoUrl,
                githubToken: data.githubtoken
            }, {
                onError: (err) => {
                    toast.error(`Error checking credits: ${err.message}`);
                }
            });
        }

        // Don't reset here - keep form data for project creation
        return true;
    }

    const hasEnoughCredits = checkCredits.data?.credits
        ? checkCredits.data.fileCount <= checkCredits.data.credits
        : true;

    const isCreatingProject = !!checkCredits.data;

    return (
        <div className="flex items-center gap-12 h-full justify-center">
            <img src='/create.svg' alt="program" className="h-56 w-auto" />
            <div>
                <div>
                    <h1 className="font-semibold text-2xl">
                        Link your GitHub Repository
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the URL of your repository to link it to GitGenius
                    </p>
                </div>
                <div className="h-4"></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            required
                            {...register("projectName")}
                            placeholder="Project Name"
                            disabled={isCreatingProject} // Disable after credit check
                        />
                        <div className="h-2"></div>
                        <Input
                            required
                            {...register("repoUrl")}
                            placeholder="GitHub Repository URL"
                            disabled={isCreatingProject} // Disable after credit check
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register("githubtoken")}
                            placeholder="GitHub Token (Optional, for private repos)"
                            disabled={isCreatingProject} // Disable after credit check
                        />
                        <div className="h-4"></div>

                        {!!checkCredits.data && (
                            <div className={`mt-4 px-4 py-2 rounded-md border ${hasEnoughCredits
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <Info className='size-4' />
                                    <p className="text-sm">
                                        You will be charged <strong>{checkCredits.data.fileCount}</strong> credits for this repository
                                    </p>
                                </div>
                                <p className={`text-sm ml-6 ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                                    You have <strong>{checkCredits.data.credits}</strong> credits remaining
                                </p>
                                {!hasEnoughCredits && (
                                    <p className="text-sm ml-6 mt-1 font-semibold">
                                        Insufficient credits! Please purchase more.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 mt-4">
                            <Button
                                type='submit'
                                disabled={
                                    createProject.isPending ||
                                    checkCredits.isPending ||
                                    (isCreatingProject && !hasEnoughCredits)
                                }
                            >
                                {checkCredits.isPending
                                    ? "Checking..."
                                    : createProject.isPending
                                        ? "Creating..."
                                        : isCreatingProject
                                            ? "Create Project"
                                            : "Check Credits"
                                }
                            </Button>

                            {isCreatingProject && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        checkCredits.reset();
                                        // Form data is preserved, just reset the credits check
                                    }}
                                >
                                    Change Repository
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage;