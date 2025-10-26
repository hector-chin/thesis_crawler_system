def handler(event, context):
    base_url = 'https://arxiv.org'
    category_list = [
        'astro-ph',
        'cond-mat',
        'cs',
        'econ',
        'eess',
        'gr-qc',
        'hep-ex',
        'hep-lat',
        'hep-ph',
        'hep-th',
        'math',
        'math-ph',
        'nlin',
        'nucl-ex',
        'nucl-th',
        'physics',
        'q-bio',
        'q-fin',
        'quant-ph',
        'stat',
    ]
    for category in category_list:
        print(f"{base_url}/list/{category}")
    # TODO: Implement the crawling logic here
