#!/usr/bin/env node

import { authenticate } from "@google-cloud/local-auth";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import { google } from "googleapis";
import path from "path";

const drive = google.drive("v3");
const docs = google.docs("v1");

// Helper function to process markdown content with full formatting support
async function processMarkdownContent(content: string, requests: any[], startIndex: number, documentId: string) {
  // First, convert markdown to plain text and collect all formatting information
  const formattedContent = parseMarkdownToFormatted(content);
  
  // Insert all text at once
  requests.push({
    insertText: {
      location: { index: startIndex },
      text: formattedContent.text
    }
  });

  // Then apply all formatting
  for (const format of formattedContent.formats) {
    if (format.type === 'paragraph') {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: startIndex + format.start,
            endIndex: startIndex + format.end
          },
          paragraphStyle: format.style,
          fields: Object.keys(format.style).join(',')
        }
      });
    } else if (format.type === 'text') {
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: startIndex + format.start,
            endIndex: startIndex + format.end
          },
          textStyle: format.style,
          fields: Object.keys(format.style).join(',')
        }
      });
    } else if (format.type === 'list') {
      requests.push({
        createParagraphBullets: {
          range: {
            startIndex: startIndex + format.start,
            endIndex: startIndex + format.end
          },
          bulletPreset: format.bulletPreset
        }
      });
    }
  }
}

// Helper function to parse markdown and extract formatting
function parseMarkdownToFormatted(content: string): { text: string; formats: any[] } {
  const lines = content.split('\n');
  let text = '';
  let formats: any[] = [];
  let currentPos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim() === '') {
      text += '\n';
      currentPos += 1;
      continue;
    }

    let lineText = line;
    let paragraphStyle: any = null;
    let isList = false;
    let listType: 'NUMBERED' | 'BULLET' | null = null;

    // Headers
    if (line.startsWith('# ')) {
      lineText = line.substring(2);
      paragraphStyle = { namedStyleType: 'HEADING_1' };
    } else if (line.startsWith('## ')) {
      lineText = line.substring(3);
      paragraphStyle = { namedStyleType: 'HEADING_2' };
    } else if (line.startsWith('### ')) {
      lineText = line.substring(4);
      paragraphStyle = { namedStyleType: 'HEADING_3' };
    } else if (line.startsWith('#### ')) {
      lineText = line.substring(5);
      paragraphStyle = { namedStyleType: 'HEADING_4' };
    } else if (line.startsWith('##### ')) {
      lineText = line.substring(6);
      paragraphStyle = { namedStyleType: 'HEADING_5' };
    } else if (line.startsWith('###### ')) {
      lineText = line.substring(7);
      paragraphStyle = { namedStyleType: 'HEADING_6' };
    }
    // Lists
    else if (line.match(/^(\d+)\.\s/)) {
      lineText = line.replace(/^(\d+)\.\s/, '');
      isList = true;
      listType = 'NUMBERED';
    } else if (line.match(/^[-*+]\s/)) {
      lineText = line.replace(/^[-*+]\s/, '');
      isList = true;
      listType = 'BULLET';
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      lineText = line.substring(2);
      paragraphStyle = { 
        indentFirstLine: { magnitude: 18, unit: 'PT' },
        indentStart: { magnitude: 18, unit: 'PT' },
        borderLeft: { width: { magnitude: 3, unit: 'PT' }, color: { color: { rgbColor: { red: 0.8, green: 0.8, blue: 0.8 } } } }
      };
    }

    // Process inline formatting and build clean text
    const processed = processInlineMarkdown(lineText, currentPos);
    text += processed.text + '\n';
    formats.push(...processed.formats);

    const lineStart = currentPos;
    const lineEnd = currentPos + processed.text.length;

    // Add paragraph formatting
    if (paragraphStyle) {
      formats.push({
        type: 'paragraph',
        start: lineStart,
        end: lineEnd,
        style: paragraphStyle
      });
    }

    // Add list formatting
    if (isList && listType) {
      formats.push({
        type: 'list',
        start: lineStart,
        end: lineEnd,
        bulletPreset: listType === 'NUMBERED' ? 'NUMBERED_DECIMAL_ALPHA_ROMAN' : 'BULLET_DISC_CIRCLE_SQUARE'
      });
    }

    currentPos += processed.text.length + 1; // +1 for newline
  }

  return { text, formats };
}

// Helper function to process inline markdown formatting
function processInlineMarkdown(text: string, basePos: number): { text: string; formats: any[] } {
  let cleanText = text;
  let formats: any[] = [];
  let offset = 0;

  // Bold **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let boldMatch;
  while ((boldMatch = boldRegex.exec(text)) !== null) {
    const start = basePos + boldMatch.index - offset;
    const end = start + boldMatch[1].length;
    
    formats.push({
      type: 'text',
      start,
      end,
      style: { bold: true }
    });
    
    cleanText = cleanText.replace(boldMatch[0], boldMatch[1]);
    offset += 4; // ** at start and end
  }

  // Italic *text*
  const italicRegex = /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g;
  let italicMatch;
  while ((italicMatch = italicRegex.exec(text)) !== null) {
    const adjustedIndex = italicMatch.index - Math.floor(offset * italicMatch.index / text.length);
    const start = basePos + adjustedIndex;
    const end = start + italicMatch[1].length;
    
    formats.push({
      type: 'text',
      start,
      end,
      style: { italic: true }
    });
  }

  // Strikethrough ~~text~~
  text = text.replace(/~~(.*?)~~/g, (match, content) => {
    const start = basePos + cleanText.indexOf(content);
    const end = start + content.length;
    
    formats.push({
      type: 'text',
      start,
      end,
      style: { strikethrough: true }
    });
    
    return content;
  });

  // Code `text`
  cleanText = cleanText.replace(/`([^`]+?)`/g, (match, content) => {
    const start = basePos + cleanText.indexOf(content);
    const end = start + content.length;
    
    formats.push({
      type: 'text',
      start,
      end,
      style: { 
        fontSize: { magnitude: 10, unit: 'PT' },
        weightedFontFamily: { fontFamily: 'Courier New' },
        backgroundColor: { color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } } }
      }
    });
    
    return content;
  });

  // Links [text](url)
  cleanText = cleanText.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, (match, linkText, url) => {
    const start = basePos + cleanText.indexOf(linkText);
    const end = start + linkText.length;
    
    formats.push({
      type: 'text',
      start,
      end,
      style: { 
        foregroundColor: { color: { rgbColor: { red: 0, green: 0, blue: 1 } } },
        underline: true,
        link: { url }
      }
    });
    
    return linkText;
  });

  return { text: cleanText, formats };
}


// Helper function to process HTML content
async function processHtmlContent(content: string, requests: any[], startIndex: number, documentId: string) {
  // For now, convert HTML to markdown and process
  let markdownContent = content
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '---')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
    .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags

  await processMarkdownContent(markdownContent, requests, startIndex, documentId);
}

const server = new Server(
  {
    name: "gdrive",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  const pageSize = 10;
  const params: any = {
    pageSize,
    fields: "nextPageToken, files(id, name, mimeType)",
  };

  if (request.params?.cursor) {
    params.pageToken = request.params.cursor;
  }

  const res = await drive.files.list(params);
  const files = res.data.files!;

  return {
    resources: files.map((file) => ({
      uri: `gdrive:///${file.id}`,
      mimeType: file.mimeType,
      name: file.name,
    })),
    nextCursor: res.data.nextPageToken,
  };
});

async function readFileContent(fileId: string) {
  // First get file metadata to check mime type
  const file = await drive.files.get({
    fileId,
    fields: "mimeType",
  });

  // For Google Docs/Sheets/etc we need to export
  if (file.data.mimeType?.startsWith("application/vnd.google-apps")) {
    let exportMimeType: string;
    switch (file.data.mimeType) {
      case "application/vnd.google-apps.document":
        exportMimeType = "text/markdown";
        break;
      case "application/vnd.google-apps.spreadsheet":
        exportMimeType = "text/csv";
        break;
      case "application/vnd.google-apps.presentation":
        exportMimeType = "text/plain";
        break;
      case "application/vnd.google-apps.drawing":
        exportMimeType = "image/png";
        break;
      default:
        exportMimeType = "text/plain";
    }

    const res = await drive.files.export(
      { fileId, mimeType: exportMimeType },
      { responseType: "text" },
    );

    return {
      mimeType: exportMimeType,
      content: res.data,
    };
  }

  // For regular files download content
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  const mimeType = file.data.mimeType || "application/octet-stream";
  
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return {
      mimeType: mimeType,
      content: Buffer.from(res.data as ArrayBuffer).toString("utf-8"),
    };
  } else {
    return {
      mimeType: mimeType,
      content: Buffer.from(res.data as ArrayBuffer).toString("base64"),
    };
  }
}

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const fileId = request.params.uri.replace("gdrive:///", "");
  const result = await readFileContent(fileId);
  
  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: result.mimeType,
        text: result.content,
      },
    ],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gdrive_search",
        description: "Search for files specifically in your Google Drive account (don't use exa nor brave to search for files)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "gdrive_read_file",
        description: "Read a file from Google Drive using its Google Drive file ID (don't use exa nor brave to read files)",
        inputSchema: {
          type: "object",
          properties: {
            file_id: {
              type: "string",
              description: "The ID of the file to read",
            },
          },
          required: ["file_id"],
        },
      },
      {
        name: "gdrive_create_file",
        description: "Create a new file in Google Drive with content",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the file to create",
            },
            content: {
              type: "string",
              description: "The content to write to the file",
            },
            mimeType: {
              type: "string",
              description: "MIME type of the file (defaults to text/plain)",
            },
            parentFolderId: {
              type: "string",
              description: "ID of the parent folder (optional, defaults to root)",
            },
          },
          required: ["name", "content"],
        },
      },
      {
        name: "gdrive_create_folder",
        description: "Create a new folder in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the folder to create",
            },
            parentFolderId: {
              type: "string",
              description: "ID of the parent folder (optional, defaults to root)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "gdrive_update_file",
        description: "Update the content of an existing file in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            file_id: {
              type: "string",
              description: "The ID of the file to update",
            },
            content: {
              type: "string",
              description: "The new content for the file",
            },
            mimeType: {
              type: "string",
              description: "MIME type of the file (optional)",
            },
          },
          required: ["file_id", "content"],
        },
      },
      {
        name: "gdrive_rename_file",
        description: "Rename a file or folder in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            file_id: {
              type: "string",
              description: "The ID of the file to rename",
            },
            new_name: {
              type: "string",
              description: "The new name for the file",
            },
          },
          required: ["file_id", "new_name"],
        },
      },
      {
        name: "gdrive_create_document",
        description: "Create a new Google Doc with rich formatting support",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the document to create",
            },
            content: {
              type: "string",
              description: "Content with rich formatting support: markdown (# headers, **bold**, *italic*, ~~strikethrough~~, `code`, [links](url), > quotes, - bullets, 1. numbers), HTML tags, or plain text",
            },
            parentFolderId: {
              type: "string",
              description: "ID of the parent folder (optional, defaults to root)",
            },
            format_type: {
              type: "string",
              enum: ["markdown", "html", "plain"],
              description: "Content format type (defaults to auto-detect)",
            },
          },
          required: ["name", "content"],
        },
      },
      {
        name: "gdrive_update_document",
        description: "Update an existing Google Doc with rich formatting support",
        inputSchema: {
          type: "object",
          properties: {
            file_id: {
              type: "string",
              description: "The ID of the Google Doc to update",
            },
            content: {
              type: "string",
              description: "Content with rich formatting support: markdown (# headers, **bold**, *italic*, ~~strikethrough~~, `code`, [links](url), > quotes, - bullets, 1. numbers), HTML tags, or plain text",
            },
            format_type: {
              type: "string",
              enum: ["markdown", "html", "plain"],
              description: "Content format type (defaults to auto-detect)",
            },
          },
          required: ["file_id", "content"],
        },
      },
      {
        name: "gdrive_refresh_auth",
        description: "Refresh Google Drive authentication to get updated permissions",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "gdrive_search") {
    const userQuery = request.params.arguments?.query as string;
    const escapedQuery = userQuery.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const formattedQuery = `fullText contains '${escapedQuery}'`;
    
    const res = await drive.files.list({
      q: formattedQuery,
      pageSize: 10,
      fields: "files(id, name, mimeType, modifiedTime, size)",
    });
    
    const fileList = res.data.files
      ?.map((file: any) => `${file.name} (${file.mimeType}) - ID: ${file.id}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Found ${res.data.files?.length ?? 0} files:\n${fileList}`,
        },
      ],
      isError: false,
    };
  } else if (request.params.name === "gdrive_read_file") {
    const fileId = request.params.arguments?.file_id as string;
    if (!fileId) {
      throw new McpError(ErrorCode.InvalidParams, "File ID is required");
    }

    try {
      const result = await readFileContent(fileId);
      return {
        content: [
          {
            type: "text",
            text: result.content,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_create_file") {
    const { name, content, mimeType = "text/plain", parentFolderId } = request.params.arguments as any;
    
    if (!name || !content) {
      throw new McpError(ErrorCode.InvalidParams, "Name and content are required");
    }

    try {
      const fileMetadata: any = {
        name,
      };
      
      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      // Handle Google Workspace conversions
      const media: any = {
        body: content,
      };

      if (mimeType === "application/vnd.google-apps.document") {
        // Convert to Google Doc from HTML or plain text
        media.mimeType = content.includes('<') ? "text/html" : "text/plain";
        fileMetadata.mimeType = "application/vnd.google-apps.document";
      } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
        // Convert to Google Sheets from CSV
        media.mimeType = "text/csv";
        fileMetadata.mimeType = "application/vnd.google-apps.spreadsheet";
      } else {
        media.mimeType = mimeType;
      }

      const res = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name, mimeType, size, createdTime",
      });

      return {
        content: [
          {
            type: "text",
            text: `File created successfully!\nName: ${res.data.name}\nID: ${res.data.id}\nType: ${res.data.mimeType}\nSize: ${res.data.size} bytes\nCreated: ${res.data.createdTime}`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_create_folder") {
    const { name, parentFolderId } = request.params.arguments as any;
    
    if (!name) {
      throw new McpError(ErrorCode.InvalidParams, "Folder name is required");
    }

    try {
      const fileMetadata: any = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };
      
      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const res = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType, createdTime",
      });

      return {
        content: [
          {
            type: "text",
            text: `Folder created successfully!\nName: ${res.data.name}\nID: ${res.data.id}\nCreated: ${res.data.createdTime}`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating folder: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_update_file") {
    const { file_id, content, mimeType } = request.params.arguments as any;
    
    if (!file_id || !content) {
      throw new McpError(ErrorCode.InvalidParams, "File ID and content are required");
    }

    try {
      // First check if it's a Google Workspace document
      const fileInfo = await drive.files.get({
        fileId: file_id,
        fields: "mimeType, name",
      });

      if (fileInfo.data.mimeType?.startsWith("application/vnd.google-apps")) {
        return {
          content: [
            {
              type: "text",
              text: `Cannot directly update Google Workspace document "${fileInfo.data.name}". Use gdrive_update_document instead for Google Docs, or export and recreate for other Google Workspace files.`,
            },
          ],
          isError: true,
        };
      }

      const media: any = {
        body: content,
      };
      
      if (mimeType) {
        media.mimeType = mimeType;
      }

      const res = await drive.files.update({
        fileId: file_id,
        media,
        fields: "id, name, mimeType, size, modifiedTime",
      });

      return {
        content: [
          {
            type: "text",
            text: `File updated successfully!\nName: ${res.data.name}\nID: ${res.data.id}\nType: ${res.data.mimeType}\nSize: ${res.data.size} bytes\nModified: ${res.data.modifiedTime}`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error updating file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_rename_file") {
    const { file_id, new_name } = request.params.arguments as any;
    
    if (!file_id || !new_name) {
      throw new McpError(ErrorCode.InvalidParams, "File ID and new name are required");
    }

    try {
      const res = await drive.files.update({
        fileId: file_id,
        requestBody: {
          name: new_name,
        },
        fields: "id, name, mimeType, modifiedTime",
      });

      return {
        content: [
          {
            type: "text",
            text: `File renamed successfully!\nNew name: ${res.data.name}\nID: ${res.data.id}\nType: ${res.data.mimeType}\nModified: ${res.data.modifiedTime}`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error renaming file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_refresh_auth") {
    try {
      await refreshAuthentication();
      return {
        content: [
          {
            type: "text",
            text: "Authentication refreshed successfully! The server now has updated permissions to create, modify, and delete files in Google Drive.",
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error refreshing authentication: ${error.message}\nPlease ensure your OAuth credentials are properly configured.`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_create_document") {
    const { name, content, parentFolderId, format_type } = request.params.arguments as any;
    
    if (!name || !content) {
      throw new McpError(ErrorCode.InvalidParams, "Name and content are required");
    }

    try {
      // Create empty document first
      const fileMetadata: any = {
        name,
        mimeType: "application/vnd.google-apps.document",
      };
      
      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const res = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType, createdTime, webViewLink",
      });

      const documentId = res.data.id!;

      // Now add formatted content using the same system as update
      const requests: any[] = [];
      let currentIndex = 1;
      
      // Auto-detect format if not specified
      let detectedFormat = format_type;
      if (!detectedFormat) {
        if (content.includes('<') && content.includes('>')) {
          detectedFormat = 'html';
        } else if (content.includes('**') || content.includes('##') || content.includes('*') || content.includes('`')) {
          detectedFormat = 'markdown';
        } else {
          detectedFormat = 'plain';
        }
      }

      if (detectedFormat === 'markdown') {
        await processMarkdownContent(content, requests, currentIndex, documentId);
      } else if (detectedFormat === 'html') {
        await processHtmlContent(content, requests, currentIndex, documentId);
      } else {
        // Plain text
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: content
          }
        });
      }

      // Apply all formatting requests
      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: requests
          }
        });
      }

      return {
        content: [
          {
            type: "text",
            text: `Google Doc created successfully!\nName: ${res.data.name}\nID: ${res.data.id}\nType: ${res.data.mimeType}\nCreated: ${res.data.createdTime}\nView: ${res.data.webViewLink}\nFormat: ${detectedFormat}`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating Google Doc: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === "gdrive_update_document") {
    const { file_id, content, format_type } = request.params.arguments as any;
    
    if (!file_id || !content) {
      throw new McpError(ErrorCode.InvalidParams, "File ID and content are required");
    }

    try {
      // First get the current document info
      const fileInfo = await drive.files.get({
        fileId: file_id,
        fields: "name, mimeType",
      });

      if (fileInfo.data.mimeType !== "application/vnd.google-apps.document") {
        return {
          content: [
            {
              type: "text",
              text: `File is not a Google Doc. Use gdrive_update_file for regular files.`,
            },
          ],
          isError: true,
        };
      }

      // Get the current document to find the end index
      const doc = await docs.documents.get({
        documentId: file_id,
      });

      const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;

      // Clear the document content (except the last character which can't be deleted)
      if (endIndex > 2) { // Need at least 2 characters to have a valid range
        await docs.documents.batchUpdate({
          documentId: file_id,
          requestBody: {
            requests: [{
              deleteContentRange: {
                range: {
                  startIndex: 1,
                  endIndex: endIndex - 1,
                }
              }
            }]
          }
        });
      }

      // Parse content based on format type
      const requests: any[] = [];
      let currentIndex = 1;
      
      // Auto-detect format if not specified
      let detectedFormat = format_type;
      if (!detectedFormat) {
        if (content.includes('<') && content.includes('>')) {
          detectedFormat = 'html';
        } else if (content.includes('**') || content.includes('##') || content.includes('*') || content.includes('`')) {
          detectedFormat = 'markdown';
        } else {
          detectedFormat = 'plain';
        }
      }

      if (detectedFormat === 'markdown') {
        await processMarkdownContent(content, requests, currentIndex, file_id);
      } else if (detectedFormat === 'html') {
        await processHtmlContent(content, requests, currentIndex, file_id);
      } else {
        // Plain text
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: content
          }
        });
      }

      // Apply all formatting requests
      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId: file_id,
          requestBody: {
            requests: requests
          }
        });
      }

      return {
        content: [
          {
            type: "text",
            text: `Google Doc updated successfully!\nName: ${fileInfo.data.name}\nID: ${file_id}\nFormat: ${detectedFormat}\nThe document content has been replaced with rich formatted text.`,
          },
        ],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error updating Google Doc: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
  throw new Error("Tool not found");
});

const credentialsPath = process.env.MCP_GDRIVE_CREDENTIALS || path.join(process.cwd(), "credentials", ".gdrive-server-credentials.json");

async function authenticateAndSaveCredentials() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "credentials", "gcp-oauth.keys.json");
  
  console.log("Looking for keys at:", keyPath);
  console.log("Will save credentials to:", credentialsPath);
  
  const auth = await authenticate({
    keyfilePath: keyPath,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/documents"
    ],
  });
  
  fs.writeFileSync(credentialsPath, JSON.stringify(auth.credentials));
  console.log("Credentials saved. You can now run the server.");
}

async function refreshAuthentication() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "credentials", "gcp-oauth.keys.json");
  
  const auth = await authenticate({
    keyfilePath: keyPath,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/documents"
    ],
  });
  
  fs.writeFileSync(credentialsPath, JSON.stringify(auth.credentials));
  
  // Update the global auth instance
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials(auth.credentials);
  google.options({ auth: authClient });
  
  return true;
}

async function loadCredentialsAndRunServer() {
  if (!fs.existsSync(credentialsPath)) {
    console.error(
      "Credentials not found. Please run with 'auth' argument first.",
    );
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);
  google.options({ auth });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.argv[2] === "auth") {
  authenticateAndSaveCredentials().catch(console.error);
} else {
  loadCredentialsAndRunServer().catch((error) => {
    process.stderr.write(`Error: ${error}\n`);
    process.exit(1);
  });
}
