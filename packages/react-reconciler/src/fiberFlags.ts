export type Flags = number;

export const NoFlags = 0b0000001;
export const Placement = 0b0000010; // 结构相关标记
export const Update = 0b0000100; // 属性相关标记
export const ChildDeletion = 0b0001000; // 结构相关标记

export const MutationMask = Placement | Update | ChildDeletion;
