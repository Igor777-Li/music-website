"use client";

type ConfirmDialogProps = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title = "Confirm",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
      "
      onClick={onCancel}
    >
      {/* 弹窗主体 */}
      <div
        className="
          w-[360px]
          rounded-xl
          bg-[#111]
          border border-white/10
          p-5
          text-white
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="text-lg font-semibold mb-2">
          {title}
        </div>

        {/* 内容 */}
        <div className="text-sm text-white/70 mb-5">
          {message}
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="
              px-4 py-1.5
              rounded
              text-sm
              bg-white/10
              hover:bg-white/20
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-1.5
              rounded
              text-sm
              bg-indigo-400
              hover:bg-red-400
              text-black
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
