declare module '*.svg?vueComponent' {
  import { Component } from 'vue'
  const src: Component
  export default src
}

declare module '*.svg?jsx' {
  import { ReactElement } from 'react'
  const src: ReactElement<any, any>
  export default src
}
