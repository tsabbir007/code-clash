"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MainToolbarContent } from "./main-toolbar-content";

interface SimpleEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  showSaveButton?: boolean;
  readOnly?: boolean;
}

export const SimpleEditor = ({
  initialContent = '',
  onSave,
  showSaveButton = false,
  readOnly = false
}: SimpleEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 focus:outline-none",
      },
    },
  });

  const handleSave = () => {
    if (onSave && editor) {
      const content = editor.getHTML();
      onSave(content);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      {!readOnly && (
        <MainToolbarContent
          editor={editor}
          onSave={handleSave}
          showSaveButton={showSaveButton}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};
