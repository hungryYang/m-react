// 递归中的递阶段

import { FiberNode } from './fiber';
import { HostComponent, HostRoot } from './workTags';
import { processUpdateQueue, UpdateQueue } from './updateQuete';

export const beginWork = (wip: FiberNode): any => {
	// 比较返回子fiberNode
	switch (wip) {
		/**
		 * 工作流程：
		 * 	1. 计算状态的最新值
		 * 	2. 创造子fiberNode
		 * */
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
	}
};

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;
	return;
}
