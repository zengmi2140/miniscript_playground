/**
 * 占位模块：@bitcoinerlab/descriptors 的 keyExpressions → ledger 链会引用
 * @ledgerhq/ledger-bitcoin。本应用不使用硬件钱包，仅满足打包器解析与 tree-shaking，
 * 避免安装并打入真实的 @ledgerhq/ledger-bitcoin。
 *
 * 若误调用 Ledger API，会在 descriptors 库内部抛错，与「未连接设备」一致。
 */
class AppClient {}

module.exports = {
  AppClient,
};
