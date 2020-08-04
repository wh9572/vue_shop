<template>
  <div>

    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '','center']" v-for="(item1,index1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteAuthById(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染所有二级权限 -->
                <el-row :class="[index2 === 0 ? '' : 'bdtop','center']"
                v-for="(item2,index2) in item1.children"
                :key="item2.id" >
                  <el-col :span="6">
                     <el-tag type="success" closable @close="deleteAuthById(scope.row,item2.id)" >
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18" >
                    <el-tag   type="warning" v-for="(item3) in item2.children"
                    :key="item3.id" closable @close="deleteAuthById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>

                </el-row>
              </el-col>
            </el-row>
            <!-- 格式化展开 -->
            <!-- <pre>
              {{scope.row.children}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetAuthDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

      <el-dialog
        title="分配权限"
        :visible.sync="setAuthDialogVisible"
        width="50%" @close="setAuthDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="authList" :props="treeProps"  show-checkbox node-key="id"
        default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setAuthDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotAuths">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框显示与隐藏
      setAuthDialogVisible: false,
      // 所有权限数据
      authList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的数组
      defKeys: [],
      // 即将分配权限的角色id
      roleId: []
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }

      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 根据id删除对应的权限
    async deleteAuthById(role, authId) {
      // 提示用户是否删除
      const result = await
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

      if (result !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${authId}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }

      // 直接复制最新页面状态  得到停留效果
      role.children = res.data

      // this.getRolesList()  会刷新页面  不保留当前页面状态
    },
    // 展示分配权限对话框
    async showSetAuthDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.err('分配权限失败！')
      }
      // 获取到所有的权限数据
      this.authList = res.data

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setAuthDialogVisible = true
    },
    // 递归获取所有三级权限的id  保存到defKeys数组中
    // 把三级权限添加到数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的事件
    setAuthDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotAuths() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }

      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setAuthDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.center {
  display: flex;
  align-items: center;
}
</style>
