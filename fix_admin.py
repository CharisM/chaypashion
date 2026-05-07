f = open('app/admin/page.tsx', 'r', encoding='utf-8')
content = f.read()
f.close()

# The structure should be:
# {activeSection === "orders" && (filtered.length === 0 ? (...) : <>{map}{loadmore}</>)}
# Then the outer <> closes with </>
# Currently line 890 has </> which closes the outer fragment too early
# We need: ...loadmore)}\n            </>)}\n          </>

old = '            )}\n            </>\n        )}\n      </div>'
new = '            )}\n            </>)}\n          </>\n        )}\n      </div>'

if old in content:
    content = content.replace(old, new, 1)
    print('fixed')
else:
    print('not found, showing area:')
    idx = content.find('            </>')
    print(repr(content[idx-100:idx+100]))

f = open('app/admin/page.tsx', 'w', encoding='utf-8')
f.write(content)
f.close()
