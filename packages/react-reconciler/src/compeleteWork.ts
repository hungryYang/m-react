/**
 * 递归中的归阶段
 * 对于Host类型fiberNode： 构建离屏DOM树
 * 标记Update flag
 *
 * completeWork性能优化策略
 * flags分布在不同fiberNode中，如何快速找到他们？
 *
 * 答案：利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode
 * */

import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { NoFlags } from './fiberFlags';

export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alertnate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				/**
				 * 1. 构建DOM
				 * 2. 将DOM插入到DOM树
				 * */
				const instance = createInstance(wip.type, newProps);
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			/**
			 * 1. 构建DOM
			 * 2. 将DOM插入到DOM树
			 * */
			if (current !== null && wip.stateNode) {
				// update
			} else {
				wip.stateNode = createTextInstance(newProps.content);
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
	}
};

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node?.tag === HostComponent || node?.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
