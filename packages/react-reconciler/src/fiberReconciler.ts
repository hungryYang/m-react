import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

/**
 * 执行createRoot后内部执行
 * */
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	// 创建更新机制队列
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

/**
 * 执行render后内部执行
 * .render(<App/>) App组件对应的element就是element
 * */
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType | null>(element);
	// 将首屏渲染与更新机制进行连接
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	// 串联调用workLoop
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
