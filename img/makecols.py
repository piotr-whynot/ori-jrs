codes=["#5a8f41",
"#7241cc",
"#89da4c",
"#ce4ac5",
"#82db99",
"#442a76",
"#d8c851",
"#7b77d2",
"#d35b33",
"#5f91ba",
"#d04464",
"#81c6be",
"#87316a",
"#a27c35",
"#d378b1",
"#415438",
"#c3a8c8",
"#733a32",
"#d0ad8e",
"#3f374f"]
for i in range(len(codes)):
    code=codes[i]
    svgtext="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"32\" height=\"45\"><rect y=\"7.575\" x=\"10.279\" height=\"14.5\" width=\"12.625\" fill=\"#fff\"/><path d=\"M16.544 3.612c-6.573 0-12.044 5.691-12.044 11.866 0 2.778 1.564 6.308 2.694 8.746l9.306 17.872 9.262-17.872c1.13-2.438 2.738-5.791 2.738-8.746 0-6.175-5.383-11.866-11.956-11.866zm0 7.155c2.584.017 4.679 2.122 4.679 4.71s-2.095 4.663-4.679 4.679c-2.584-.017-4.679-2.09-4.679-4.679 0-2.588 2.095-4.693 4.679-4.71z\" fill=\""+code+"\" stroke=\""+code+"\" stroke-width=\"1.1\" stroke-linecap=\"round\"/></svg>"
    with open ("marker"+str(i)+".svg", "w") as outf:
        outf.write(svgtext)

