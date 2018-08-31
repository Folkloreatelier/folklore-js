<?php

namespace App\Reducers;

use Folklore\Panneau\Support\ExtractColumnReducer;

class SlugExtractReducer extends ExtractColumnReducer
{
    protected function getExtractedColumns()
    {
        $columns = [];
        $locales = config('locale.locales', [config('app.locale')]);
        foreach ($locales as $column) {
            $columns['slug_'.$column] = 'data.slug.'.$locale;
        }
        return $columns;
    }
}
