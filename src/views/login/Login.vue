<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="../../assets/logo.png" alt="" srcset="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="LoginFormRef" :rules="LoginFormRules" :model="LoginForm" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input  v-model="LoginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="LoginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      LoginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证
      LoginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在  6到 15 个字符', trigger: 'blur' }
        ]

      }
    }
  },
  methods: {
    // 重置按钮
    resetLoginForm () {
      this.$refs.LoginFormRef.resetFields()
    },
    login () {
      this.$refs.LoginFormRef.validate(async res => {
        // console.log(res)
        if (!res) return
        const result = await this.$http.post('login', this.LoginForm)
        // console.log(result.data)
        if (result.data.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 1.将登陆成功之后的token，保存到客户端的 sessionStorage 中
        // 1.1 项目中出现登录之外的其他API接口，必须登录之后才能访问
        // 1.2 token值应当前网站打开期间有效，所以讲token保存在 sessionStorage中
        window.sessionStorage.setItem('token', result.data.data.token)
        // 2. 通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
    .login_box {
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 3px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);

      .avater_box {
        height: 130px;
        width: 130px;
        border: 1px solid #ccc;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #eee;
        }

      }
    }
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
