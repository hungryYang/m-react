import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

export class FiberNode {
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	pendingProps: Props;
	memoizedState: any;
	memoizedProps: Props | null;
	flags: Flags;
	subtreeFlags: Flags;
	alertnate: FiberNode | null;
	updateQueue: unknown;
	deletions: FiberNode[] | null;
	/**
	 * @params
	 *  tag: FiberNode是什么类型的节点
	 * 	pendingProps: 接下来需要改变的props
	 *  key: ReactElement Key
	 * */
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// HostComponent <div> divDOM stateNode保存div的DOM
		this.stateNode = null;
		// FunctionComponent () => {} FiberNode类型
		this.type = null;

		// 构成树状结构
		// 根节点  BFS深度遍历
		this.return = null; // 指向父fiberNode
		this.sibling = null;
		this.child = null;
		this.index = 0; //遍历同级节点位置记录

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // 刚开始工作时Props是什么
		this.memoizedProps = null; // 工作完以后确定的Props
		this.memoizedState = null;
		/**
		 * 	比如挂载<div></div> jsx("div") 对应改变fiberNode null，生成子fiberNode对应标记Placement
		 * 	将<div></div>更新为<p></p> jsx("p") 对应改变fiberNode { type: "div" }，生成子fiberNode 对应标记 Deletion Placement
		 * 	当所有ReactElement比较完成，生成一棵新fiberNode树
		 * 	 	current：与视图中真实UI对应的fiberNode树
		 * 	 	workInProgress: 触发更新后，正在reconciler中计算的fiberNode树
		 * 	双缓存模式
		 */
		this.alertnate = null; // 	记录切换 current fiberNode 和 workingProgram fiberNode
		this.updateQueue = null;
		this.deletions = null;

		this.flags = NoFlags; // 改变时的对应标记
		this.subtreeFlags = NoFlags;
	}
}
/**
 * ReactDOM.createRoot(rootElement).render(<App/>)
 * createRoot  生成- fiberRootNode
 * 							current↓    ↑ stateNode
 * rootElement 生成- hostRootFiber
 * 								child↓    ↑ return
 *                  		App
 * */
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alertnate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alertnate = current;
		current.alertnate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}

	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
	wip.memoizedProps = current.memoizedProps;
	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// div type: div
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
