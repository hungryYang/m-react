// 递归中的递阶段

import { FiberNode } from './fiber';

export const beginWork = (fiber: FiberNode): any => {
	// 比较返回子fiberNode
	console.log(fiber);
};
