// 递归中的递阶段

import { FiberNode } from './fiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { processUpdateQueue, UpdateQueue } from './updateQuete';
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';

export const beginWork = (wip: FiberNode) => {
	console.log(wip, 'beginWork');
	// 比较返回子fiberNode
	switch (wip.tag) {
		/**
		 * 工作流程：
		 * 	1. 计算状态的最新值
		 * 	2. 创造子fiberNode
		 * */
		case HostRoot:
			return updateHostRoot(wip);

		/**
		 * 工作流程：
		 * 	1. 创建子fiberNode
		 * */
		case HostComponent:
			return updateHostComponent(wip);

		/**
		 * HostText没有子节点没有beginWork工作流程
		 * 开启归阶段completeWork
		 * */
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	/**
	 * <A>
	 *   <B/>
	 * <A/>
	 * 进行更新时传进的B不是function类型 memoizedState就是传进来的action
	 * */
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	/**
	 * updateContainer
	 * */
	const nextChildren = wip.memoizedState;
	// 创造子fiberNoe
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);

	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alertnate;
	/**
	 * 性能优化策略
	 * mount流程大量节点更新
	 * */
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
