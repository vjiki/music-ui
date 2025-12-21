interface StoryCircleProps {
  userName: string;
  profileImageURL?: string;
  isViewed?: boolean;
  isCreate?: boolean;
  onClick: () => void;
}

export default function StoryCircle({
  userName,
  profileImageURL,
  isViewed = false,
  isCreate = false,
  onClick,
}: StoryCircleProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[70px]"
    >
      <div className="relative">
        {isCreate ? (
          <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-pink-500 via-orange-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <div className="w-[60px] h-[60px] rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-2xl">+</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`w-[70px] h-[70px] rounded-full p-[2px] ${
              isViewed
                ? 'border-2 border-white border-opacity-30'
                : 'bg-gradient-to-br from-pink-500 via-orange-500 to-purple-500'
            }`}
          >
            <div className="w-full h-full rounded-full bg-black overflow-hidden">
              {profileImageURL ? (
                <img
                  src={profileImageURL}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white bg-opacity-10 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 text-center truncate w-full">
        {userName}
      </span>
    </button>
  );
}

