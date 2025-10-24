import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollsCommits } from "@/lib/github";
import { X } from "lucide-react";
import { Erica_One } from "next/font/google";
import { error } from "console";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.create({
            data: {
                name: input.name,
                githubUrl: input.githubUrl,
                UserToProject: {
                    create: {
                        userId: ctx.user.userId!
                    }
                }
            }
        });
        await pollsCommits(project.id);
        return project;
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                UserToProject: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        pollsCommits(input.projectId).then().catch(console.error);
        return await ctx.db.commit.findMany({ where: { projectId: input.projectId } })
    })
})