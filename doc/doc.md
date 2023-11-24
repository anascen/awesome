# awesome

```
npm install --save-dev awesome lint-staged
npx awesome install
npm pkg set scripts.prepare="awesome install"
npx awesome add .husky/pre-commit "npx lint-staged"
```