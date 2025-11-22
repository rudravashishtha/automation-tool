# AI Node Abstraction System

This system eliminates the need to create a new folder structure every time you want to add a new AI node. Instead of manually creating multiple files (node.tsx, dialog.tsx, executor.ts, actions.ts), you can now add new AI providers with just a few lines of configuration.

## 🚀 Quick Start

### Option 1: Using the Template System (Recommended)

The easiest way to add a new AI provider is to use the template system:

```typescript
import { addAIProvider, createAIProviderNode } from "../lib/ai-node-templates";

// Define your new provider
const myProvider = {
  name: "MyNewAI",
  type: NodeType.MYNEWAI, // Add to NodeType enum first
  logo: "/logos/mynewai.svg",
  models: ["model-1", "model-2"],
  defaultModel: "model-1",
  channelName: "mynewai-execution",
  fetchToken: async () => ({ token: "mynewai-token" }),
  dialogComponent: MyNewAIDialog, // Create this component
};

// Add to system
addAIProvider(myProvider);

// Export the node
export const MyNewAINode = createAIProviderNode(myProvider);
```

### Option 2: Using the Factory Directly

For more control, use the factory directly:

```typescript
import { createAINode } from "../lib/ai-node-factory";

export const MyNewAINode = createAINode({
  type: "MYNEWAI",
  name: "MyNewAI",
  icon: "/logos/mynewai.svg",
  channelName: "mynewai-execution",
  fetchToken: fetchMyNewAIRealtimeToken,
  dialogComponent: MyNewAIDialog,
  getDescription: (data) => {
    return data.userPrompt 
      ? `${data.model}: ${data.userPrompt.slice(0, 50)}...`
      : "Not configured";
  }
});
```

## 📁 What You Don't Need to Create Anymore

**Before (manual process):**
```
components/
├── mynewai/
│   ├── mynewai-node.tsx
│   ├── mynewai-dialog.tsx
│   ├── mynewai-executor.ts
│   └── actions.ts
```

**After (using templates):**
```
// Just add to the template registry and create the dialog component
// Everything else is generated automatically!
```

## 🔧 Complete Setup Guide

### Step 1: Add NodeType to Schema

Add your new provider to the NodeType enum in `schema.prisma`:

```prisma
enum NodeType {
  // ... existing types
  MYNEWAI
}
```

### Step 2: Create the Dialog Component

Create your dialog component (this is the only file you need to create):

```typescript
// components/mynewai/mynewai-dialog.tsx
import { useForm } from "react-hook-form";
// ... other imports

export const MyNewAIDialog = ({ open, onOpenChange, onSubmit, defaultValues }) => {
  // Your dialog implementation
};
```

### Step 3: Add to Template Registry

Add your provider to the template system:

```typescript
// lib/ai-node-templates.ts
const myNewProvider = {
  name: "MyNewAI",
  type: NodeType.MYNEWAI,
  logo: "/logos/mynewai.svg",
  models: ["model-1", "model-2"],
  defaultModel: "model-1",
  channelName: "mynewai-execution",
  fetchToken: fetchMyNewAIRealtimeToken,
  dialogComponent: MyNewAIDialog,
};

addAIProvider(myNewProvider);
```

### Step 4: Register Executor

Add your executor to the executor registry:

```typescript
// lib/executor-registry.ts
import { MyNewAIExecutor } from "../components/mynewai/mynewai-executor";

export const EXECUTOR_REGISTRY: Record<NodeType, NodeExecutor<any>> = {
  // ... existing executors
  [NodeType.MYNEWAI]: MyNewAIExecutor,
};
```

## 🏭 Factory System Architecture

### Core Components

1. **ai-node-factory.tsx** - Creates node components
2. **ai-provider-factory.tsx** - Creates dialogs, executors, and actions
3. **ai-node-templates.ts** - Template registry for easy provider registration

### How It Works

1. **Template System**: Define providers with configuration objects
2. **Factory Pattern**: Generate components from templates
3. **Registry Pattern**: Central registration and management
4. **Reusable Components**: Base components handle common functionality

## 📋 Available Templates

Currently supported providers:
- **OpenAI** (GPT models)
- **Anthropic** (Claude models)
- **Gemini** (Google models)
- **Deepseek** (Deepseek models)
- **Grok** (xAI models)

## 🛠️ Advanced Usage

### Custom Node Configuration

```typescript
const customNode = createAINode({
  type: "CUSTOM",
  name: "My Custom Node",
  icon: "🤖", // Can use emoji or path
  channelName: "custom-execution",
  fetchToken: async () => ({ token: "custom-token" }),
  dialogComponent: CustomDialog,
  getDescription: (data) => {
    // Custom description logic
    return data.customField || "No description";
  }
});
```

### Dynamic Provider Registration

```typescript
// Add providers at runtime
function addProviderAtRuntime(providerConfig) {
  const provider = createAIProvider(providerConfig);
  addAIProvider(provider);
  return createAIProviderNode(provider);
}
```

## 🎯 Benefits

1. **No More Boilerplate**: Eliminates repetitive file creation
2. **Consistency**: All providers follow the same pattern
3. **Maintainability**: Changes to base components affect all providers
4. **Extensibility**: Easy to add new providers
5. **Type Safety**: Full TypeScript support
6. **Flexibility**: Can still customize individual components

## 🔍 Troubleshooting

### Common Issues

1. **Type Errors**: Make sure NodeType enum includes your new provider
2. **Missing Dialog**: Create the dialog component before referencing it
3. **Token Issues**: Implement the fetchToken function properly
4. **Channel Problems**: Ensure channel names are unique

### Debug Steps

1. Check that all imports are correct
2. Verify NodeType enum includes your provider
3. Ensure dialog component exports properly
4. Test the node component in isolation

## 🚀 Future Enhancements

- **Auto-generator script**: CLI tool to generate complete providers
- **Plugin system**: Allow third-party providers
- **Configuration UI**: Visual provider management
- **Executor templates**: Reusable executor patterns

## 📚 Examples

See the `examples/` directory for complete working examples:
- `adding-new-ai-providers.tsx` - How to add new providers
- `anthropic-factory-example.tsx` - Concrete implementation example