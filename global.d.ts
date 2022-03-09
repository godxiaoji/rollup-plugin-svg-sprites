declare module '*.svg?vueComponent' {
  import { Component } from 'vue'
  const src: Component
  export default src
}

declare module '*.svg?jsx' {
  import React from 'react'
  const src: React.FC<React.SVGAttributes<SVGSVGElement>>
  export default src
}
