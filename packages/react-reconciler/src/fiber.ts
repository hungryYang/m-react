import { Props, Key, Ref } from 'shared/ReactTypes';
import { workTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
	tag: workTag;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	pendingProps: Props;
	memoizedProps: Props | null;
	flags: Flags;
	alertnate: FiberNode | null;

	/**
	 * @params
	 *  tag: FiberNode是什么类型的节点
	 * 	pendingProps: 接下来需要改变的props
	 *  key: ReactElement Key
	 * */
	constructor(tag: workTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// HostComponent <div> divDOM stateNode保存div的DOM
		this.stateNode = null;
		// FunctionComponent () => {} FiberNode类型
		this.type = null;

		// 构成树状结构
		// 根节点  BFS深度遍历
		this.return = null; // 指向父fiberNoode
		this.sibling = null;
		this.child = null;
		this.index = 0; //遍历同级节点位置记录

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // 刚开始工作时Props是什么
		this.memoizedProps = null; // 工作完以后确定的Props

		/**
		 * 	比如挂载<div></div> jsx("div") 对应改变fiberNode null，生成子fiberNode对应标记Placement
		 * 	将<div></div>更新为<p></p> jsx("p") 对应改变fiberNode { type: "div" }，生成子fiberNode 对应标记 Deletion Placement
		 * 	当所有ReactElement比较完成，生成一棵新fiberNode树
		 * 	 	current：与视图中真实UI对应的fiberNode树
		 * 	 	workInProgress: 触发更新后，正在reconciler中计算的fiberNode树
		 * 	双缓存模式
		 */
		this.alertnate = null; // 	记录切换 current fiberNode 和 workingProgram fiberNode

		this.flags = NoFlags; // 改变时的对应标记
	}
}
