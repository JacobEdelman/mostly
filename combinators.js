function lit(x){//for any letter,regex, or number
  return function(y){
    matched=y.match(x);
    return {match:(matched && matched[0]===y),val:(matched && matched[0]),rightOverflow:"",leftOverflow:""};//not lists
  }
}
var none=lit("");
function or(x,y){
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
  return function(){
    var ret=x.apply(null,arguments);//no this I guess?
    if(ret.match){
      ret.rightOverflow+=r;
      ret.leftOverflow+=l;
    }
    return ret;
  }
}
function point(n){
  return eval("(function(){return "+n+".apply(null,arguments)})");
}
var rules={};
// S = - c
//   | - S c
// - = a b
// a - = - a
rules.done = or(cat(point("rules.minus"),lit("c")),cat(point("rules.minus"),point("rules.done"),lit("c")));
rules.none= cat(point("rules.minus"),lit("c"));
rules.minus=or(cat(lit("a"),lit("b")),context("b",cat(point("rules.minus"),lit("b")),""))
//rules.end=or(context("",cat(lit("iu"),point("rules.end")),"i"),lit("^"));
//rules.ident=context("a",or(lit(/[a-zA-Z_$]/),cat(lit(/[a-zA-Z_$0-9]/),point("rules.ident"))),'b');
console.log(rules.done("aaabbbccc"));
///hmmm... so can it parse anything? well in checking to see if something is parsable mine might just add enough to the sides to go on forever... yes I think it is that powerfu;
