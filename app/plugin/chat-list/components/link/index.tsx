import React from "react";
export interface ChatLinkProps {
  className?: string;
  link: string;
}

export default function ChatLink(props: ChatLinkProps) {
  const { link, className } = props;
  return (
    <div
      className={`ba-black bg-opacity-70 border-solid border-2 border-gray-200 pl-2 pr-2 pt-4  pb-4 flex items-center ${className}`}
    >
      <img
        className={`w-4 h-4 mr: 2`}
        src={
          "https://cdn.mindverse.com/img/zzzz202301031672746087872%E7%BB%84.png"
        }
        alt={"chatbox.drawPicture"}
      />
      <div
        className={
          "whitespace-nowrap overflow-ellipsis overflow-hidden text-blue-400"
        }
      >
        <a
          className={"text-blue-400 text-xl"}
          href={!link.startsWith("http") ? `https://${link}` : link}
          target="_blank"
        >
          {!link.startsWith("http") ? `https://${link}` : link}
        </a>
      </div>
    </div>
  );
}
