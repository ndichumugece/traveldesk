import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'list': '+1' }],
        ['link', 'clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor">
            <style>{`
                .rich-text-editor .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #e2e8f0;
                    background-color: #f8fafc;
                    padding: 0.75rem;
                }
                .rich-text-editor .ql-container.ql-snow {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #e2e8f0;
                    background-color: #f8fafc;
                    font-family: inherit;
                    min-height: 200px;
                }
                .rich-text-editor .ql-editor {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: #0f172a;
                    padding: 1rem;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: #94a3b8;
                    font-style: normal;
                }
                .rich-text-editor .ql-snow.ql-toolbar button:hover,
                .rich-text-editor .ql-snow .ql-toolbar button:hover {
                    color: #3b82f6;
                }
                .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
                .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
                    color: #3b82f6;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
