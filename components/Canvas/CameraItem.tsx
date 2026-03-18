
import React from 'react';
import { Camera as CameraIcon, RotateCw } from 'lucide-react';
import { CameraState } from '../../types';

interface CameraItemProps {
    camera: CameraState;
    isSelected: boolean;
    onMouseDown: (e: React.MouseEvent, action: string) => void;
}

const CameraItem: React.FC<CameraItemProps> = ({ camera, isSelected, onMouseDown }) => {
    return (
        <div onMouseDown={(e) => onMouseDown(e, 'camera-move')}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-[100] cursor-move"
            style={{ left: camera.x, top: camera.y, transform: `translate(-50%, -50%) rotate(${camera.rotation}deg)`, width: 100, height: 100 }}
        >
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-t-[80px] border-l-transparent border-r-transparent border-t-yellow-400/30"></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 ${isSelected ? 'border-yellow-400 scale-110' : 'border-white'}`}>
                <CameraIcon className="w-5 h-5 transform rotate-180" />
            </div>
            {isSelected && (
                <div className="absolute -top-[40px] left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center cursor-ew-resize z-[101]"
                    onMouseDown={(e) => onMouseDown(e, 'camera-rotate')}
                    onClick={(e) => e.stopPropagation()}
                >
                    <RotateCw className="w-3 h-3" />
                </div>
            )}
        </div>
    );
};

export default CameraItem;
