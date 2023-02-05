import { FiberNode } from './fiber';
import { beginWork } from './beginWork';
import { completeWork } from './compeleteWork';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);
}

function workLoop() {
	// 持续执行
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	// 如果没有子节点
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

/**
 * 当前节点递归完成查找兄弟节点
 * */
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node?.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node?.return;
		workInProgress = node;
	} while (node !== null);
}
