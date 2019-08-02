module.exports = (...specs) => new Promise((resolve, reject) => {
  const cleanups = [];
  for (const [target, yEvents, nEvents] of specs)
    for (const [types, end] of [[yEvents, resolve], [nEvents || [], reject]])
      for (const type of types) {
        const cb = function(...data) {
          for (const cb of cleanups) cb();
          end({ target, type, data });
        };
        cleanups.push(
          (target.off || target.removeListener || target.removeEventListener)
          .bind(target, type, cb)
        );
        (target.on || target.addListener || target.addEventListener)
          .call(target, type, cb, false);
      }
});
