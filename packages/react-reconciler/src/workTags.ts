export type workTag =
	| typeof FunctionComponent
	| typeof HostComponent
	| typeof HostRoot
	| typeof HostText;

export const FunctionComponent = 0;
/**
 * 根节点元素
 * */
export const HostRoot = 3;
// div
export const HostComponent = 5;
// <div>123</div?
export const HostText = 5;
