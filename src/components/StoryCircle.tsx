import SafeImage from './SafeImage';

interface StoryCircleProps {
  userName: string;
  profileImageURL?: string;
  isViewed?: boolean;
  isCreate?: boolean;
  onClick: () => void;
  size?: 'normal' | 'small';
}

export default function StoryCircle({
  userName,
  profileImageURL,
  isViewed = false,
  isCreate = false,
  onClick,
  size = 'normal',
}: StoryCircleProps) {
  const isSmall = size === 'small';
  const circleSize = isSmall ? 'w-8 h-8' : 'w-[70px] h-[70px]';
  const innerSize = isSmall ? 'w-7 h-7' : 'w-[60px] h-[60px]';
  const iconSize = isSmall ? 'text-sm' : 'text-2xl';
  const showLabel = !isSmall && userName;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`flex flex-col items-center ${isSmall ? 'gap-0' : 'gap-2'} ${isSmall ? '' : 'min-w-[70px]'}`}
      title={isSmall ? userName : undefined}
    >
      <div className="relative">
        {isCreate ? (
          <div className={`${circleSize} rounded-full bg-gradient-to-br from-pink-500 via-orange-500 to-purple-500 p-[2px]`}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <div className={`${innerSize} rounded-full bg-white bg-opacity-10 flex items-center justify-center`}>
                <span className={iconSize}>+</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${circleSize} rounded-full p-[2px] ${
              isViewed
                ? 'border-2 border-white border-opacity-30'
                : 'bg-gradient-to-br from-pink-500 via-orange-500 to-purple-500'
            }`}
          >
            <div className="w-full h-full rounded-full bg-black overflow-hidden">
              {profileImageURL ? (
                <SafeImage
                  src={profileImageURL}
                  alt={userName}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full bg-white bg-opacity-10 flex items-center justify-center">
                      <span className={iconSize}>👤</span>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full bg-white bg-opacity-10 flex items-center justify-center">
                  <span className={iconSize}>👤</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 text-center truncate w-full">
          {userName}
        </span>
      )}
    </button>
  );
}

