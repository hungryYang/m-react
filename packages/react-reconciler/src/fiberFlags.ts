export type Flags = number;

export const NoFlags = 0b0000000;
export const Placement = 0b0000001; // 结构相关标记
export const Update = 0b0000010; // 属性相关标记
export const ChildDeletion = 0b0000100; // 结构相关标记

export const MutationMask = Placement | Update | ChildDeletion;
