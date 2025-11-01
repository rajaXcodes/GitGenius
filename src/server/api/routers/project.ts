import z, { includes } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollsCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { issue } from "node_modules/zod/v4/core/util.cjs";
import { tr } from "date-fns/locale";

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
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
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
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.fileReferences,
                question: input.question,
                projectId: input.projectId,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }),
    uploadMeeting: protectedProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                name: input.name,
                projectId: input.projectId,
                status: 'PROCESSING',
            }
        })
        return meeting
    }),
    getMeetings: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
            where: {
                projectId: input.projectId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                issues: true
            }
        })
    }),
    deleteMeeting: protectedProcedure.input(z.object({
        meetingId: z.string()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.delete({
            where: { id: input.meetingId }
        })
    }),
    getMeetingById: protectedProcedure.input(z.object({
        meetingId: z.string()
    })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
            where: { id: input.meetingId }, include: { issues: true }
        })
    }),
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() } })
    })

})