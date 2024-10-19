import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

export interface GitHubCommitData {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export interface CommitSummary {
  name: string;
  description: string;
  tags: string[];
}

export interface PRSummary {
  name: string;
  description: string;
  tags: string[];
}


const commitSummarySchema = z.object({
  name: z.string().describe("A short, descriptive title for this commit"),
  description: z.string().describe("A brief summary of the main changes and their purpose"),
  tags: z.array(z.string()).describe("An array of relevant tags"),
});

const parser = StructuredOutputParser.fromZodSchema(commitSummarySchema);


const llm = new ChatGroq({
  temperature: 0,
  modelName: "llama-3.1-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
});


const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that summarizes individual git commit messages. Provide a summary in the specified format."],
  ["human", "Summarize this commit:\n{commit}\n\n{format_instructions}"],
]);


const chain = prompt.pipe(llm).pipe(parser);


export const summarizeCommits = async (commits: GitHubCommitData[]): Promise<CommitSummary[]> => {
  console.log(`Starting summarization of ${commits.length} commits`);

  if (commits.length === 0) {
    console.warn('No commits provided for summarization');
    return [{ name: 'No Changes', description: 'No commits were provided for summarization.', tags: ['empty'] }];
  }
  const recentCommits = commits.slice(0, 5);
  const commitSummaries: CommitSummary[] = [];

  try {
    for (const commit of recentCommits) {
      console.log(`Summarizing commit with sha: ${commit.sha}`);

     
      const commitMessage = commit.commit.message;

      
      const result = await chain.invoke({
        commit: commitMessage,
        format_instructions: parser.getFormatInstructions(),
      });

      console.log(`Received summary for commit ${commit.sha}:`, result);

      
      commitSummaries.push(result);
    }

    return commitSummaries;

  } catch (error) {
    console.error('Error in summarizeCommits:', error);
    return recentCommits.map(() => ({
      name: 'Error in Summarization',
      description: 'An error occurred while trying to summarize the commit. Please try again later or contact support if the problem persists.',
      tags: ['error']
    }));
  }
};


const pullRequestSummarySchema = z.object({
  name: z.string().min(1).describe("A short, descriptive title for this pull request"),
  description: z.string().min(1).describe("A brief summary of the main changes and their purpose"),
  tags: z.array(z.string()).min(1).describe("An array of relevant tags indicating the nature of the PR (e.g., 'bug-fix', 'feature', 'enhancement', 'performance', 'documentation', 'refactoring', 'security', etc.)"),
});


const llm2 = new ChatGroq({
  temperature: 0,
  modelName: "llama-3.1-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
});


const prompt2 = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that summarizes individual pull requests. Provide a succinct summary that includes a clear title, a brief description of the main changes, and relevant tags without adding any extraneous characters, the tags should depict what where the changes in one word like fix, issue, feature, enchancement, etc."],
  ["human", "Summarize this pull request: Title: {prTitle} Description: {prDescription} {format_instructions}"],
]);

const parser2 = StructuredOutputParser.fromZodSchema(pullRequestSummarySchema);


const chain2 = prompt2.pipe(llm2).pipe(parser2);


export const summarizePullRequests = async (repoId: number): Promise<PRSummary[]> => {
  console.log(`Starting summarization of 5 most recent closed pull requests for repo ID: ${repoId}`);

  try {
    
    const pullRequests = await prisma.pullRequest.findMany({
      where: { 
        repoId,
         
      },
      
      take: 5 
    });

    if (pullRequests.length === 0) {
      console.warn('No closed pull requests found for summarization');
      return [{ name: 'No Recent Changes', description: 'No recently closed pull requests were found for summarization.', tags: [] }];
    }

    const pullRequestSummaries: PRSummary[] = [];

    for (const pr of pullRequests) {
      console.log(`Summarizing pull request titled: ${pr.title}`);

      
      const result = await chain2.invoke({
        prTitle: pr.title,
        prDescription: pr.description,
        format_instructions: parser2.getFormatInstructions(),
      });

      console.log(`Received summary for pull request ${pr.title}:`, result);

      
      const prSummary: PRSummary = {
        name: result.name || pr.title,
        description: result.description || 'No description available',
        tags: result.tags || [],
      };

      pullRequestSummaries.push(prSummary);
    }

    return pullRequestSummaries;

  } catch (error) {
    console.error('Error in summarizePullRequests:', error);
    return [{ name: 'Error in Summarization', description: 'An error occurred while trying to summarize the pull requests.', tags: ['error'] }];
  }
};