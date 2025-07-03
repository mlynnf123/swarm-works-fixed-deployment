import Arcade from "@arcadeai/arcadejs";

if (!process.env.ARCADE_API_KEY) {
  throw new Error("ARCADE_API_KEY environment variable is required");
}

// Initialize Arcade client
const arcadeClient = new Arcade({
  apiKey: process.env.ARCADE_API_KEY,
});

// GitHub integration functions using Arcade
export class ArcadeGitHubService {
  private client: Arcade;

  constructor() {
    this.client = arcadeClient;
  }

  // Authorize GitHub access for a user
  async authorizeGitHub(userId: string) {
    try {
      const authResponse = await this.client.tools.authorize({
        tool_name: "GitHub.SetStarred",
        user_id: userId,
      });

      if (authResponse.status !== "completed") {
        return {
          status: "pending",
          authUrl: authResponse.url,
          authId: authResponse.id,
        };
      }

      return {
        status: "completed",
        authUrl: null,
        authId: authResponse.id,
      };
    } catch (error) {
      console.error("GitHub authorization error:", error);
      throw error;
    }
  }

  // Wait for GitHub authorization completion
  async waitForGitHubAuth(authId: string) {
    try {
      await this.client.auth.waitForCompletion(authId);
      return true;
    } catch (error) {
      console.error("GitHub auth wait error:", error);
      return false;
    }
  }

  // Star a repository
  async starRepository(userId: string, owner: string, name: string) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.SetStarred",
        input: {
          owner,
          name,
          starred: true,
        },
        user_id: userId,
      });

      return {
        success: true,
        message: response.output.value,
      };
    } catch (error) {
      console.error("Repository star error:", error);
      return {
        success: false,
        message: "Failed to star repository",
      };
    }
  }

  // Unstar a repository
  async unstarRepository(userId: string, owner: string, name: string) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.SetStarred",
        input: {
          owner,
          name,
          starred: false,
        },
        user_id: userId,
      });

      return {
        success: true,
        message: response.output.value,
      };
    } catch (error) {
      console.error("Repository unstar error:", error);
      return {
        success: false,
        message: "Failed to unstar repository",
      };
    }
  }

  // Get repository information
  async getRepository(userId: string, owner: string, name: string) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.GetRepository",
        input: {
          owner,
          name,
        },
        user_id: userId,
      });

      return {
        success: true,
        data: response.output,
      };
    } catch (error) {
      console.error("Get repository error:", error);
      return {
        success: false,
        data: null,
      };
    }
  }

  // List user repositories
  async listUserRepositories(userId: string, username: string) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.ListUserRepositories",
        input: {
          username,
        },
        user_id: userId,
      });

      return {
        success: true,
        data: response.output,
      };
    } catch (error) {
      console.error("List repositories error:", error);
      return {
        success: false,
        data: null,
      };
    }
  }

  // Create a new repository
  async createRepository(userId: string, repositoryData: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
  }) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.CreateRepository",
        input: repositoryData,
        user_id: userId,
      });

      return {
        success: true,
        data: response.output,
      };
    } catch (error) {
      console.error("Create repository error:", error);
      return {
        success: false,
        data: null,
      };
    }
  }

  // Create an issue
  async createIssue(userId: string, owner: string, repo: string, issueData: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.CreateIssue",
        input: {
          owner,
          repo,
          ...issueData,
        },
        user_id: userId,
      });

      return {
        success: true,
        data: response.output,
      };
    } catch (error) {
      console.error("Create issue error:", error);
      return {
        success: false,
        data: null,
      };
    }
  }

  // Fork a repository
  async forkRepository(userId: string, owner: string, repo: string) {
    try {
      const response = await this.client.tools.execute({
        tool_name: "GitHub.ForkRepository",
        input: {
          owner,
          repo,
        },
        user_id: userId,
      });

      return {
        success: true,
        data: response.output,
      };
    } catch (error) {
      console.error("Fork repository error:", error);
      return {
        success: false,
        data: null,
      };
    }
  }
}

// Export singleton instance
export const arcadeGitHub = new ArcadeGitHubService();