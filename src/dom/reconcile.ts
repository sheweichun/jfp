import {IVnode} from '../common/element.type'
import {VnodeStatus} from '../common/constant'
import { isNothing } from '../utils'


// function lcs<T>(
//     aArr:T[],
//     bArr:T[],
//     aHead = 0,
//     aTail = aArr.length - 1,
//     bHead = 0,
//     bTail = bArr.length - 1
//   ) {
//     let keymap = {},
//       unkeyed = [],
//       idxUnkeyed = 0,
//       ch,
//       item,
//       k,
//       idxInOld,
//       key
  
//     let newLen = bArr.length
//     let oldLen = aArr.length
//     let minLen = Math.min(newLen, oldLen)
//     let tresh = Array(minLen + 1)
//     tresh[0] = -1
  
//     for (var i = 1; i < tresh.length; i++) {
//       tresh[i] = aTail + 1
//     }
//     let link = Array(minLen)
  
//     for (i = aHead; i <= aTail; i++) {
//       item = aArr[i]
//       key = item.key
//       if (key != null) {
//         keymap[key] = i
//       } else {
//         unkeyed.push(i)
//       }
//     }
  
//     for (i = bHead; i <= bTail; i++) {
//       ch = bArr[i]
//       idxInOld = ch.key == null ? unkeyed[idxUnkeyed++] : keymap[ch.key]
//       if (idxInOld != null) {
//         k = binarySearch(tresh, idxInOld)
//         if (k >= 0) {
//           tresh[k] = idxInOld
//           link[k] = { newi: i, oldi: idxInOld, prev: link[k - 1] }
//         }
//       }
//     }
  
//     k = tresh.length - 1
//     while (tresh[k] > aTail) k--
  
//     let ptr = link[k]
//     let diff = Array(oldLen + newLen - k)
//     let curNewi = bTail,
//       curOldi = aTail
//     let d = diff.length - 1
//     while (ptr) {
//       const { newi, oldi } = ptr
//       while (curNewi > newi) {
          
//         diff[d--] = VnodeStatus.INSERT
//         curNewi--
//       }
//       while (curOldi > oldi) {
//         diff[d--] = VnodeStatus.REMOVE
//         curOldi--
//       }
//       diff[d--] = VnodeStatus.UPDATE
//       curNewi--
//       curOldi--
//       ptr = ptr.prev
//     }
//     while (curNewi >= bHead) {
//       diff[d--] = VnodeStatus.INSERT
//       curNewi--
//     }
//     while (curOldi >= aHead) {
//       diff[d--] = VnodeStatus.REMOVE
//       curOldi--
//     }
//     return {
//       diff,
//       keymap,
//     }
// }



// function createArray(n:number){
//   const n
// }

function lcsVnodeCompare(a:IVnode, b:IVnode){
  if(!isNothing(a.key) || !isNothing(b.key)){
    return a.key === b.key && a.type === b.type
  }
  return a.type === b.type
}

function extractCommonArray(dp:number[][], a:IVnode[], b:IVnode[], i:number, j:number, indexMap:{[key:number]:number} = {}){
  if(i === 0 || j === 0) return indexMap
  const curAIndex = i - 1, curBIndex = j - 1
  if(lcsVnodeCompare(a[curAIndex], b[curBIndex])){
    // arr.unshift(a[i-1])
    a[curAIndex].status = VnodeStatus.UPDATE
    b[curBIndex].status = VnodeStatus.UPDATE
    indexMap[curBIndex] = curAIndex
    return extractCommonArray(dp, a, b, curAIndex, curBIndex, indexMap)
  }else if(dp[i][curBIndex] > dp[curAIndex][j]){
    return extractCommonArray(dp, a, b, i ,curBIndex, indexMap)
  }
  return extractCommonArray(dp, a, b, curAIndex ,j, indexMap)
}



export function lcs(a:IVnode[], b:IVnode[]){  //a-旧， b-新
  const aLen = a.length, bLen = b.length;
  const dp:number[][] = [Array(bLen + 1).fill(0)]
  for(let i = 1; i <= aLen; i++){
    dp[i] = [0]
    const curA = a[i-1]
    curA.status = VnodeStatus.REMOVE
    for(let j = 1; j <= bLen; j++){
      const curB = b[j-1]
      curB.status = VnodeStatus.INSERT
      if(lcsVnodeCompare(curA, curB)){
        dp[i][j] = dp[i-1][j-1] + 1
      }else{
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
      }
    }
  }
  return extractCommonArray(dp, a, b, aLen, bLen)
  // const subArr = extractCommonArray(dp, a, b, aLen, bLen)
  // return {
  //   list: subArr,
  //   len: dp[aLen][bLen]
  // }
}

function binarySearch(ktr:number[], j: number) { //二分查找
    let lo = 0
    let hi = ktr.length - 1
    while (lo <= hi) {
      let mid = (lo + hi) >>> 1
      if( j === ktr[mid] ){
          return mid
      }else if (j < ktr[mid]){
        hi = mid - 1
      }else{
        lo = mid + 1 
      }
    }
    return -1
}

// export 