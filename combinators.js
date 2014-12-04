function lit(x){//for any letter,regex, or number
  return function(y){
    matched=y.match(x);
    return {match:(matched && matched[0]===y),val:(matched && matched[0]),rightOverflow:"",leftOverflow:""};//not lists
  }
}
//effectively... I want to ensure that I do execute both streams at some
function or(x,y){
  // so.... what if both>?????
  return function(z){
    var tx=x(z);
    if(tx.match)return tx;
    var ty=y(z);
    if(ty.match)return ty;
    return {match:false}
  }
}
function than(x,y){//so by memoizing this should turn into nearley effectively...
  function zMatcher(z){//does this even need to use proto?
    if(zMatcher.prototype.memoizer[z])return zMatcher.prototype.memoizer[z];//kinda slow but I don't think too much
    else zMatcher.prototype.memoizer[z]={match:false};//this prevents useless recursing
    var tx,ty;
    for(var i=0;i<=z.length;i++){
      tx=x(z.slice(0,i));
      if(tx.match){
        ty=y(tx.rightOverflow+z.slice(i));//not that there is no overflow of nonterminals
        if(ty.match)break;
      }
      ty=y(z.slice(i));
      if(ty.match && ty.leftOverflow){//this should prevent annoying things where rightOverflow hasn't works and we don't want to re try it
        tx=x(z.slice(0,i)+ty.leftOverflow);//not that there is no overflow of nonterminals
        if(tx.match)break;
      }
    }
    if(tx.match && ty.match)zMatcher.prototype.memoizer[z]={val:[tx.val,ty.val],match:true,rightOverflow:ty.rightOverflow,leftOverflow:tx.leftOverflow};//good enough
    return zMatcher.prototype.memoizer[z];
  }
  zMatcher.prototype.memoizer={};
  return zMatcher;
}
function cat(){

  var ret=arguments[Object.keys(arguments).slice(-1)];
  for(var i=arguments.length-2;i>=0;i--)ret=than(arguments[i],ret);
  return ret;
}
function context(l,x,r){
  //returns a function that will have l,r on the left hand side (on opposite ends) and x on the right
  return function(){
    var ret=x.apply(null,arguments);//no this I guess?
    if(ret.match){
      return {val:ret.val,match:true,rightOverflow:ret.rightOverflow+r,leftOverflow:l+ret.leftOverflow};
    }
    return ret;
  }
}
function pnt(n){
  return eval("(function(){return rules."+n+".apply(null,arguments)})");
}
function matches(f){
  return function(){
    var x=f.apply(null,arguments)
    return (x.match && !x.rightOverflow && !x.leftOverflow);
  }
}
var rules={};
// S = - c
//   | - S c
// - = a b
// a - = - a
//so.... in general I'd like to do both really... aka... try to do both.... but won't that cause slowing????maybe not too mcuh???
//so what kinda thing is happneing here??

 rules.done = or(cat(pnt("minus"),pnt("done"),lit("c")),cat(pnt("minus"),lit("c")));
 rules.minus=or(context("b",cat(pnt("minus"),lit("b")),""),cat(lit("a"),lit("b")));
//rules.end=or(context("",cat(lit("iu"),point("rules.end")),"i"),lit("^"));
//rules.ident=context("a",or(lit(/[a-zA-Z_$]/),cat(lit(/[a-zA-Z_$0-9]/),point("rules.ident"))),'b');
console.log(matches(rules.done)("abc"));//true
console.log(matches(rules.done)("aabbcc"));//true
console.log(matches(rules.done)("aaaaaaaaabbbbbbbbbccccccccc"));//true
console.log(matches(rules.done)("aaabbcc"));//false
console.log(matches(rules.done)("aaabbbcc"));//false
console.log(matches(rules.done)("aabbccc"));//false
///hmmm... so can it parse anything? well in checking to see if something is parsable mine might just add enough to the sides to go on forever... yes I think it is that powerfu;
// best does ab to minus ,
//hmm... assuming determinist means that at any point only one possible parse rule will be applicable... that would mean ensuring
